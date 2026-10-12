# Frontend Integration Handoff Specification

> **BOUNDARY NOTICE**: Per strict architectural constraints, the frontend UI, client routes, mock stores, and styles were **NOT** modified during this phase. This document specifies the exact contracts, endpoints, and wiring steps required to connect the frontend to the newly implemented Supabase backend.

---

## 1. Overview & Connection Architecture

The backend is built upon **Supabase Project `ufcpvjhzitmxgitoaolx`** (PostgreSQL 17.11).

- **Client-side queries (Public)**: Direct Supabase client using `VITE_SUPABASE_ANON_KEY`, governed by strict Row-Level Security (RLS) policies that only allow reading records where `publication_status = 'Published'` and files in the `public-marketing` bucket.
- **Client-side queries (Staff)**: Supabase client with authenticated JWT session (`staff_profiles.is_active = true`), allowing role-scoped CRUD operations based on Administrator, Manager, Agent, and Viewer roles.
- **Privileged transactions**: Handled via stored database procedures (`rpc`) such as `publish_offer_atomic`, `create_reservation_atomic`, `reserve_package_atomic`, `complete_deal_win`, `convert_enquiry_to_lead`, and `generate_rent_charges_for_month`.

---

## 2. Screen-by-Screen Integration Contracts

### 2.1 Public Property Catalog & Filtering
- **Existing Frontend Screen**: `src/routes/properties/index.tsx`, `src/components/properties/PropertyList.tsx`
- **Current Data Source**: `src/data/source.json` / static array
- **Required Backend Call**:
  ```ts
  import { InventoryService } from "@/backend/services/inventory.service";
  // OR client-side:
  const { data, count } = await supabase
    .from("marketing_offers")
    .select("id, ref, slug, marketing_title, district, city, side, record_type, mode, layout_label, bathrooms, gross_m2, net_m2, area_m2, amount, currency, price_type, price_basis, expenses_amount, availability, cover_image_path, cbi_eligible, cbi_verified, published_snapshot, published_at", { count: "exact" })
    .eq("publication_status", "Published")
    .range(offset, offset + limit - 1);
  ```
- **Request Parameters**:
  - `district` (string filter)
  - `side` ('Europe' | 'Asia')
  - `mode` ('sale' | 'rent')
  - `minPrice` / `maxPrice` (number)
  - `currency` ('USD' | 'TRY' | 'EUR' | 'GBP')
  - `cbiEligible` (boolean)
  - `page`, `pageSize`, `sortBy` ('price_asc' | 'price_desc' | 'newest')
- **Response Shape**:
  ```ts
  {
    offers: MarketingOfferRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  ```
- **Auth Requirements**: Anonymous / Public (Anon Key).
- **Error & Loading Behavior**: Display skeleton cards while loading; empty state if 0 results.
- **Cache Invalidation**: TanStack Query key: `['public-properties', filters]`, stale time: 5 minutes.

---

### 2.2 Property Details Page & Slug Redirects
- **Existing Frontend Screen**: `src/routes/properties/$slug.tsx`
- **Required Backend Call**:
  ```ts
  const result = await InventoryService.getPublicOfferBySlug(slug);
  ```
- **Redirect Handling**:
  - If `result.found === false` and `result.redirect` exists:
    ```ts
    if (result.redirect) {
      throw redirect({ to: `/properties/${result.redirect.newSlug}`, statusCode: result.redirect.redirectType });
    }
    ```
- **Response Shape**:
  ```ts
  {
    found: boolean;
    offer?: MarketingOfferWithRelations;
    redirect?: { newSlug: string; redirectType: 301 | 302 };
  }
  ```
- **Auth Requirements**: Anonymous.

---

### 2.3 Public Consultation & Property Enquiry Form
- **Existing Frontend Screens**: `src/components/forms/EnquiryModal.tsx`, Contact section, Property modal enquiry.
- **Required Backend Call**:
  ```ts
  import { EnquiryService } from "@/backend/services/enquiry.service";
  // Or POST to server API route /api/enquiries:
  const result = await EnquiryService.submitPublicEnquiry(formData, clientIp);
  ```
- **Request Payload**:
  ```ts
  {
    name: string;
    email: string;
    phone: string;
    topic: string;
    budget?: string;
    message: string;
    source: "Website Consultation" | "WhatsApp Click" | "Property Modal" | ...;
    propertySlug?: string;
    idempotencyKey?: string;
    website_hp?: ""; // MUST BE EMPTY (Bot honeypot)
  }
  ```
- **Response Shape**:
  ```ts
  {
    success: boolean;
    message: string;
    referenceId?: string;
  }
  ```
- **Auth Requirements**: Public with server-enforced rate limiting (max 6 requests / 5 mins per IP).
- **Error Handling**: Friendly toast notification; field error highlights for Zod validation errors.

---

### 2.4 Admin Inventory Management
- **Existing Frontend Screen**: `src/routes/admin/properties.tsx`
- **Backend Operations**:
  - **List Offers**:
    ```ts
    const { data } = await supabase.from("marketing_offers").select("*").order("created_at", { ascending: false });
    ```
  - **Create Draft Offer**:
    ```ts
    await InventoryService.createDraftOffer(payload, staffUserId);
    ```
  - **Atomic Publish**:
    ```ts
    await supabase.rpc("publish_offer_atomic", {
      p_offer_id: offerId,
      p_published_by: staffUserId,
      p_changelog: changelogNote,
    });
    ```
  - **Unpublish**:
    ```ts
    await supabase.rpc("unpublish_offer", {
      p_offer_id: offerId,
      p_reason: reasonNote,
    });
    ```
- **Auth Requirements**: Staff role `admin` or `manager`. (`agent` cannot publish directly).
- **Cache Invalidation**: Invalidate `['admin-properties']` and `['public-properties']`.

---

### 2.5 Admin CRM & Leads Pipeline
- **Existing Frontend Screens**: `src/routes/admin/crm.tsx`, `src/routes/admin/leads.tsx`
- **Backend Operations**:
  - **Convert Enquiry to Lead**:
    ```ts
    await supabase.rpc("convert_enquiry_to_lead", {
      p_enquiry_id: enquiryId,
      p_assigned_to: staffUserId,
    });
    ```
  - **Merge Duplicate Contacts**:
    ```ts
    await CrmService.mergeContacts({
      primaryContactId,
      duplicateContactId,
      mergedByStaffId,
      reason,
    });
    ```
  - **Update Lead Stage**:
    ```ts
    await CrmService.updateLeadStage(leadId, newStage, staffUserId, lossReason);
    ```
  - **Shortlist Management**:
    ```ts
    await CrmService.addToShortlist(contactId, offerId, staffUserId, notes);
    await CrmService.removeFromShortlist(contactId, offerId);
    ```
- **Auth Requirements**: `admin`, `manager`, or assigned `agent`.

---

### 2.6 Admin Deals & Reservations
- **Existing Frontend Screen**: `src/routes/admin/deals.tsx`
- **Backend Operations**:
  - **Create Reservation**:
    ```ts
    await supabase.rpc("create_reservation_atomic", {
      p_deal_id: dealId,
      p_offer_id: offerId,
      p_unit_id: physicalUnitId,
      p_contact_id: contactId,
      p_deposit_amount: depositAmount,
      p_deposit_currency: "USD",
      p_duration_hours: 72,
    });
    ```
  - **Reserve Package**:
    ```ts
    await supabase.rpc("reserve_package_atomic", {
      p_deal_id: dealId,
      p_package_offer_id: packageOfferId,
      p_contact_id: contactId,
      p_deposit_amount: depositAmount,
      p_deposit_currency: "USD",
      p_duration_hours: 72,
    });
    ```
  - **Win Deal (Complete Sale)**:
    ```ts
    await supabase.rpc("complete_deal_win", {
      p_deal_id: dealId,
      p_sold_by: staffUserId,
    });
    // CRITICAL: Updates ONLY deal_selected_units to 'Sold'. Buyer shortlist is untouched.
    ```
  - **Record Payment**:
    ```ts
    await TransactionService.recordPayment(paymentData, staffUserId);
    ```
- **Auth Requirements**: `admin` or `manager`.

---

### 2.7 Rental Property Management
- **Existing Frontend Screen**: `src/routes/admin/rentals.tsx`
- **Backend Operations**:
  - **Create Lease**:
    ```ts
    await RentalService.createLease(leaseData, staffUserId);
    // Overlapping active leases rejected automatically by DB trigger
    ```
  - **Generate Monthly Charges**:
    ```ts
    await supabase.rpc("generate_rent_charges_for_month", {
      p_year: 2026,
      p_month: 11,
    });
    ```
  - **Allocate Rent Payment**:
    ```ts
    await RentalService.allocateRentPayment({
      chargeId,
      amount,
      currency,
      reference,
      staffUserId,
    });
    // Cross-currency payments rejected by DB trigger
    ```
  - **Maintenance Tickets**:
    ```ts
    await RentalService.createMaintenanceTicket(ticketData, staffUserId);
    ```
- **Auth Requirements**: `admin` or `manager`.

---

### 2.8 Operations Dashboard & Reports
- **Existing Frontend Screen**: `src/routes/admin/index.tsx`
- **Backend Operations**:
  ```ts
  const metrics = await ReportingService.getDashboardMetrics();
  ```
  - Returns separate currency totals for USD, TRY, EUR, GBP.
  - Safe CSV Exports:
    ```ts
    const contactsCsv = await ReportingService.exportContactsCsv();
    const dealsCsv = await ReportingService.exportDealsCsv();
    ```

---

## 3. Exact Future Wiring Steps for Frontend Developers

1. **Install Supabase Client in Frontend**:
   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
2. **Create Supabase Provider**:
   Create `src/lib/supabase.ts` wrapping `@supabase/supabase-js` with types from `@/backend/types/database.types.ts`.
3. **Replace Mock Admin Stores**:
   In `src/admin/`, swap memory arrays for TanStack Query hooks fetching from the database tables and RPC functions documented above.
4. **Connect Public Catalog**:
   In `src/routes/properties/index.tsx`, query `marketing_offers` where `publication_status = 'Published'`.
5. **Connect Enquiry Submissions**:
   Point contact form submit handlers to `/api/enquiries` or `EnquiryService.submitPublicEnquiry`.
