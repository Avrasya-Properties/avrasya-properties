-- Schema snapshot of the existing project; local integration tests only. Never apply to a populated project.
create type public.deal_stage as enum ('Opportunity','Offer Prepared','Offer Accepted','Reserved','Due Diligence','Contract','Won','Lost');
create type public.lead_stage as enum ('New','Contacted','Qualified','Viewing','Negotiation','Converted','Lost','On Hold');
create type public.price_type as enum ('fixed','from','on-request');
create type public.staff_role as enum ('admin','manager','agent','viewer');
create type public.contact_kind as enum ('person','company');
create type public.lease_status as enum ('draft','active','terminated','expired');
create type public.currency_code as enum ('USD','TRY','EUR','GBP');
create type public.task_priority as enum ('Low','Normal','High');
create type public.viewing_status as enum ('Scheduled','Confirmed','Completed','Cancelled','No-show');
create type public.import_run_type as enum ('dry_run','full_import','sync');
create type public.price_basis_type as enum ('cash','installment_schedule','package','fixed','from','on_request','conflicting_starting_prices','scope_unconfirmed','special_offer','advertised');
create type public.import_run_status as enum ('running','completed','failed');
create type public.maintenance_status as enum ('reported','assigned','in_progress','completed','cancelled');
create type public.publication_status as enum ('Draft','In Review','Published','Archived');
create type public.maintenance_priority as enum ('Low','Normal','High','Urgent');
create type public.property_record_type as enum ('unit_offer','unit_type','package','project','ambiguous_offer');
create type public.property_availability as enum ('Available','Under Offer','Reserved','Sold','Rented','Off Market','Unknown');
create table public.staff_profiles (
id uuid not null,
email text not null,
name text not null,
role public.staff_role default 'viewer'::staff_role not null,
is_active boolean default true not null,
last_login_at timestamp with time zone,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.developers (
id uuid default gen_random_uuid() not null,
name text not null,
slug text not null,
contact_info jsonb default '{}'::jsonb not null,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.projects (
id uuid default gen_random_uuid() not null,
developer_id uuid,
name text not null,
slug text not null,
district text,
city text default 'Istanbul'::text not null,
side text,
tapu_status text,
delivery_date date,
delivery_month_year text,
delivery_relative text,
delivery_source text,
cbi_claim_verified boolean default false not null,
cbi_claim_source text,
description text,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.buildings (
id uuid default gen_random_uuid() not null,
project_id uuid not null,
name text not null,
building_code text,
total_floors integer,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.physical_units (
id uuid default gen_random_uuid() not null,
project_id uuid,
building_id uuid,
unit_number text,
floor integer,
layout_label text,
bedrooms integer,
bathrooms integer,
gross_m2 numeric,
net_m2 numeric,
unspecified_m2 numeric,
status public.property_availability default 'Unknown'::property_availability not null,
tapu_status text,
orientation text,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.marketing_offers (
id uuid default gen_random_uuid() not null,
ref text not null,
slug text not null,
marketing_title text not null,
title_provenance text,
project_id uuid,
physical_unit_id uuid,
record_type public.property_record_type default 'unit_offer'::property_record_type not null,
mode text default 'sale'::text not null,
layout_label text,
bathrooms integer,
district text not null,
city text default 'Istanbul'::text not null,
side text,
tapu_status text,
gross_m2 numeric,
net_m2 numeric,
area_m2 numeric,
amount numeric,
currency public.currency_code,
price_type public.price_type default 'fixed'::price_type not null,
price_basis public.price_basis_type default 'fixed'::price_basis_type not null,
expenses_amount numeric,
availability public.property_availability default 'Unknown'::property_availability not null,
publication public.publication_status default 'Draft'::publication_status not null,
assigned_agent_id uuid,
cover_image_path text,
description text,
source_note text,
claims_requiring_confirmation text[] default '{}'::text[] not null,
cbi_eligible boolean default false not null,
cbi_verified boolean default false not null,
version integer default 1 not null,
published_snapshot jsonb,
published_at timestamp with time zone,
created_by uuid,
updated_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.package_memberships (
id uuid default gen_random_uuid() not null,
package_offer_id uuid not null,
member_unit_id uuid,
member_offer_id uuid,
share_description text,
created_at timestamp with time zone default now() not null
);
create table public.amenities (
id uuid default gen_random_uuid() not null,
name text not null,
category text default 'General'::text not null,
icon text
);
create table public.offer_amenities (
offer_id uuid not null,
amenity_id uuid not null
);
create table public.pricing_options (
id uuid default gen_random_uuid() not null,
offer_id uuid not null,
option_name text not null,
amount numeric,
currency public.currency_code not null,
basis public.price_basis_type not null,
is_default boolean default false not null,
down_payment_amount numeric,
down_payment_percent numeric,
delivery_payment_amount numeric,
delivery_payment_percent numeric,
installment_amount numeric,
installment_count integer,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null
);
create table public.instalment_schedules (
id uuid default gen_random_uuid() not null,
pricing_option_id uuid not null,
installment_no integer not null,
due_month_offset integer,
due_date date,
amount numeric not null,
currency public.currency_code not null,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.price_history (
id uuid default gen_random_uuid() not null,
offer_id uuid not null,
old_amount numeric,
new_amount numeric,
currency public.currency_code,
basis public.price_basis_type,
changed_by uuid,
reason text,
created_at timestamp with time zone default now() not null
);
create table public.availability_history (
id uuid default gen_random_uuid() not null,
offer_id uuid,
physical_unit_id uuid,
old_status public.property_availability,
new_status public.property_availability not null,
changed_by uuid,
reason text,
created_at timestamp with time zone default now() not null
);
create table public.publication_history (
id uuid default gen_random_uuid() not null,
offer_id uuid not null,
old_status public.publication_status,
new_status public.publication_status not null,
snapshot jsonb,
changed_by uuid,
reason text,
created_at timestamp with time zone default now() not null
);
create table public.property_slug_redirects (
id uuid default gen_random_uuid() not null,
old_slug text not null,
new_slug text not null,
target_offer_id uuid not null,
created_at timestamp with time zone default now() not null
);
create table public.contacts (
id uuid default gen_random_uuid() not null,
name text not null,
kind public.contact_kind default 'person'::contact_kind not null,
email text,
phone text,
secondary_phone text,
company_name text,
tax_id text,
roles text[] default '{buyer}'::text[] not null,
language text default 'English'::text not null,
assigned_agent_id uuid,
notes text default ''::text not null,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.buyer_requirements (
id uuid default gen_random_uuid() not null,
contact_id uuid not null,
districts text[] default '{}'::text[] not null,
side text,
property_types text[] default '{}'::text[] not null,
layouts text[] default '{}'::text[] not null,
budget_min numeric,
budget_max numeric,
currency public.currency_code default 'USD'::currency_code not null,
cbi_required boolean default false not null,
timeline text,
notes text,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.contact_shortlists (
id uuid default gen_random_uuid() not null,
contact_id uuid not null,
offer_id uuid not null,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.enquiries (
id uuid default gen_random_uuid() not null,
ref_number text not null,
name text not null,
email text not null,
phone text not null,
topic text not null,
budget text,
raw_budget_text text,
message text not null,
source text not null,
property_slug text,
offer_id uuid,
campaign_params jsonb default '{}'::jsonb not null,
status text default 'New'::text not null,
ip_hash text,
user_agent text,
idempotency_key text,
contact_id uuid,
lead_id uuid,
notes text,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.leads (
id uuid default gen_random_uuid() not null,
contact_id uuid not null,
enquiry_id uuid,
source text default 'Website'::text not null,
assigned_agent_id uuid,
districts text default ''::text not null,
layout text default ''::text not null,
budget_min numeric,
budget_max numeric,
currency public.currency_code default 'USD'::currency_code not null,
stage public.lead_stage default 'New'::lead_stage not null,
loss_reason text,
next_follow_up timestamp with time zone,
shortlist uuid[] default '{}'::uuid[] not null,
deal_id uuid,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.tasks (
id uuid default gen_random_uuid() not null,
title text not null,
description text,
assignee_id uuid not null,
due_date timestamp with time zone not null,
priority public.task_priority default 'Normal'::task_priority not null,
is_done boolean default false not null,
done_at timestamp with time zone,
link_kind text,
link_id uuid,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.viewings (
id uuid default gen_random_uuid() not null,
contact_id uuid not null,
offer_id uuid,
physical_unit_id uuid,
agent_id uuid not null,
start_time timestamp with time zone not null,
end_time timestamp with time zone not null,
status public.viewing_status default 'Scheduled'::viewing_status not null,
notes text default ''::text not null,
outcome text,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.activities (
id uuid default gen_random_uuid() not null,
user_id uuid,
kind text not null,
text text not null,
ref_kind text,
ref_id uuid,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null
);
create table public.notes (
id uuid default gen_random_uuid() not null,
target_type text not null,
target_id uuid not null,
author_id uuid not null,
content text not null,
is_private boolean default false not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.contact_merges (
id uuid default gen_random_uuid() not null,
source_contact_id uuid not null,
target_contact_id uuid not null,
merged_by uuid not null,
merge_reason text not null,
snapshot jsonb not null,
created_at timestamp with time zone default now() not null
);
create table public.deals (
id uuid default gen_random_uuid() not null,
title text not null,
contact_id uuid not null,
lead_id uuid,
assigned_agent_id uuid not null,
stage public.deal_stage default 'Opportunity'::deal_stage not null,
total_amount numeric,
currency public.currency_code default 'USD'::currency_code not null,
expected_close_date timestamp with time zone,
actual_close_date timestamp with time zone,
loss_reason text,
notes text,
version integer default 1 not null,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.deal_selected_units (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
offer_id uuid,
physical_unit_id uuid,
agreed_price numeric,
currency public.currency_code not null,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.offer_revisions (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
revision_number integer not null,
offer_amount numeric not null,
currency public.currency_code not null,
payment_terms jsonb default '{}'::jsonb not null,
valid_until timestamp with time zone,
status text default 'draft'::text not null,
created_by uuid,
created_at timestamp with time zone default now() not null
);
create table public.reservations (
id uuid default gen_random_uuid() not null,
deal_id uuid,
offer_id uuid,
physical_unit_id uuid,
contact_id uuid not null,
reserved_by uuid not null,
deposit_amount numeric,
deposit_currency public.currency_code,
reserved_from timestamp with time zone default now() not null,
expires_at timestamp with time zone not null,
status text default 'active'::text not null,
cancellation_reason text,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.document_checklists (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
document_type text not null,
title text not null,
status text default 'pending'::text not null,
storage_path text,
verified_by uuid,
verified_at timestamp with time zone,
notes text,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.payment_milestones (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
milestone_name text not null,
due_date date not null,
expected_amount numeric not null,
currency public.currency_code not null,
status text default 'pending'::text not null,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.recorded_payments (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
milestone_id uuid,
payment_reference text not null,
amount numeric not null,
currency public.currency_code not null,
payment_date date default CURRENT_DATE not null,
payment_method text not null,
proof_storage_path text,
is_reversal boolean default false not null,
reversal_for_id uuid,
notes text,
recorded_by uuid not null,
created_at timestamp with time zone default now() not null
);
create table public.commission_allocations (
id uuid default gen_random_uuid() not null,
deal_id uuid not null,
agent_id uuid not null,
role_in_deal text not null,
percentage numeric not null,
calculated_amount numeric not null,
currency public.currency_code not null,
status text default 'pending'::text not null,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.leases (
id uuid default gen_random_uuid() not null,
physical_unit_id uuid not null,
offer_id uuid,
landlord_contact_id uuid not null,
tenant_contact_id uuid not null,
agent_id uuid not null,
start_date date not null,
end_date date not null,
rent_amount numeric not null,
rent_currency public.currency_code not null,
payment_frequency text default 'monthly'::text not null,
payment_due_day integer default 1 not null,
deposit_amount numeric default 0 not null,
deposit_currency public.currency_code not null,
status public.lease_status default 'draft'::lease_status not null,
terms text,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.rent_charges (
id uuid default gen_random_uuid() not null,
lease_id uuid not null,
period_start date not null,
period_end date not null,
due_date date not null,
charge_amount numeric not null,
currency public.currency_code not null,
status text default 'pending'::text not null,
created_at timestamp with time zone default now() not null
);
create table public.rent_payment_allocations (
id uuid default gen_random_uuid() not null,
charge_id uuid not null,
recorded_payment_id uuid not null,
allocated_amount numeric not null,
currency public.currency_code not null,
allocated_at timestamp with time zone default now() not null,
allocated_by uuid not null
);
create table public.rental_deposits (
id uuid default gen_random_uuid() not null,
lease_id uuid not null,
amount numeric not null,
currency public.currency_code not null,
status text default 'held'::text not null,
received_date date not null,
return_date date,
notes text,
created_at timestamp with time zone default now() not null
);
create table public.vendors (
id uuid default gen_random_uuid() not null,
company_name text not null,
contact_name text,
phone text,
email text,
specialty text not null,
notes text,
is_active boolean default true not null,
created_at timestamp with time zone default now() not null
);
create table public.maintenance_tickets (
id uuid default gen_random_uuid() not null,
physical_unit_id uuid not null,
lease_id uuid,
requester_contact_id uuid,
vendor_id uuid,
title text not null,
description text not null,
priority public.maintenance_priority default 'Normal'::maintenance_priority not null,
status public.maintenance_status default 'reported'::maintenance_status not null,
estimated_cost numeric,
actual_cost numeric,
currency public.currency_code default 'TRY'::currency_code,
resolved_at timestamp with time zone,
created_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.site_settings (
id uuid default gen_random_uuid() not null,
singleton_key text default 'default'::text not null,
company_name text default 'Avrasya Properties Group'::text not null,
registered_entity text default 'Avrasya Properties Group'::text not null,
tax_office text default 'Üsküdar / İstanbul'::text not null,
license_no text default 'İTO-34-78921'::text not null,
tagline text default 'Your Future Starts with the Right Investment.'::text not null,
email text default 'info@avrasyaproperties.com'::text not null,
phone text default '+90 545 924 80 42'::text not null,
whatsapp text default 'https://wa.me/905459248042'::text not null,
address text default 'Mimar Sinan Mahallesi, Selam-i Ali Efendi Caddesi, Ara Kafe Yanı No:17, 34672 Üsküdar / İstanbul, Türkiye'::text not null,
advisory_hours text default 'Mon – Fri: 09:30 – 18:30 TRT | Sat: By Private Appointment'::text not null,
hero_headline text default 'Curated Offers & Developments in Istanbul.'::text not null,
hero_subtitle text default 'Source-backed investment opportunities across central and Asian-side Istanbul. Every property is subject to preliminary title deed, zoning, and legal clearance before acquisition.'::text not null,
eyebrow_text text default 'Istanbul Portfolio Collection'::text not null,
cbi_threshold_usd numeric default 400000 not null,
preloader_opacity numeric default 0.5 not null,
exchange_rate_eur numeric default 0.892 not null,
exchange_rate_try numeric default 49.17 not null,
exchange_rate_gbp numeric default 0.756 not null,
enable_frankfurter_sync boolean default true not null,
announcement_text text default ''::text not null,
announcement_active boolean default false not null,
updated_by uuid,
updated_at timestamp with time zone default now() not null
);
create table public.content_pages (
id uuid default gen_random_uuid() not null,
slug text not null,
title text not null,
meta_description text,
published_status public.publication_status default 'Published'::publication_status not null,
published_version integer default 1 not null,
updated_by uuid,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.content_sections (
id uuid default gen_random_uuid() not null,
page_id uuid not null,
section_key text not null,
title text,
content_json jsonb default '{}'::jsonb not null,
sort_order integer default 0 not null,
updated_at timestamp with time zone default now() not null
);
create table public.services (
id uuid default gen_random_uuid() not null,
slug text not null,
title text not null,
category text,
description text not null,
process_steps jsonb default '[]'::jsonb not null,
sort_order integer default 0 not null,
is_published boolean default true not null,
updated_at timestamp with time zone default now() not null
);
create table public.faqs (
id uuid default gen_random_uuid() not null,
question text not null,
answer text not null,
category text default 'General'::text not null,
sort_order integer default 0 not null,
is_published boolean default true not null,
updated_at timestamp with time zone default now() not null
);
create table public.catalog_documents (
id uuid default gen_random_uuid() not null,
title text not null,
edition text,
storage_path text not null,
file_size bigint,
page_count integer,
disclaimer text,
is_published boolean default true not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.audit_events (
id uuid default gen_random_uuid() not null,
actor_id uuid,
actor_role text,
action text not null,
target_table text not null,
target_id uuid,
old_values jsonb,
new_values jsonb,
ip_address text,
user_agent text,
created_at timestamp with time zone default now() not null
);
create table public.notifications (
id uuid default gen_random_uuid() not null,
recipient_id uuid not null,
title text not null,
message text not null,
link text,
is_read boolean default false not null,
read_at timestamp with time zone,
created_at timestamp with time zone default now() not null
);
create table public.storage_files (
id uuid default gen_random_uuid() not null,
bucket text not null,
path text not null,
original_filename text not null,
mime_type text not null,
file_size bigint not null,
sha256 text,
is_public boolean default false not null,
related_entity_type text,
related_entity_id uuid,
uploaded_by uuid,
created_at timestamp with time zone default now() not null
);
create table public.source_files (
id uuid default gen_random_uuid() not null,
drive_id text not null,
folder_name text not null,
filename text not null,
asset_path text not null,
drive_url text,
mime_type text not null,
bytes bigint not null,
sha256 text not null,
import_status text default 'pending'::text not null,
error_message text,
metadata jsonb default '{}'::jsonb not null,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);
create table public.extraction_candidates (
id uuid default gen_random_uuid() not null,
source_file_id uuid,
candidate_type text not null,
raw_payload jsonb not null,
normalized_payload jsonb not null,
extraction_method text not null,
confidence numeric default 1.0,
review_status text default 'pending'::text not null,
reviewed_by uuid,
reviewed_at timestamp with time zone,
review_notes text,
created_at timestamp with time zone default now() not null
);
create table public.import_runs (
id uuid default gen_random_uuid() not null,
run_type public.import_run_type default 'full_import'::import_run_type not null,
total_sources integer default 0 not null,
imported_sources integer default 0 not null,
failed_sources integer default 0 not null,
log_messages jsonb default '[]'::jsonb not null,
started_at timestamp with time zone default now() not null,
completed_at timestamp with time zone,
status public.import_run_status default 'running'::import_run_status not null,
initiated_by uuid
);
create table public.rate_limit_entries (
id uuid default gen_random_uuid() not null,
rate_key text not null,
window_start timestamp with time zone not null,
count integer default 1 not null,
created_at timestamp with time zone default now() not null
);
alter table public.pricing_options add PRIMARY KEY (id);
alter table public.instalment_schedules add PRIMARY KEY (id);
alter table public.staff_profiles add PRIMARY KEY (id);
alter table public.staff_profiles add UNIQUE (email);
alter table public.developers add PRIMARY KEY (id);
alter table public.developers add UNIQUE (slug);
alter table public.price_history add PRIMARY KEY (id);
alter table public.projects add CHECK ((side = ANY (ARRAY['Europe'::text, 'Asia'::text, 'unknown'::text])));
alter table public.projects add PRIMARY KEY (id);
alter table public.projects add UNIQUE (slug);
alter table public.buildings add PRIMARY KEY (id);
alter table public.physical_units add PRIMARY KEY (id);
alter table public.marketing_offers add CHECK ((mode = ANY (ARRAY['sale'::text, 'rent'::text])));
alter table public.marketing_offers add CHECK ((side = ANY (ARRAY['Europe'::text, 'Asia'::text, 'unknown'::text])));
alter table public.marketing_offers add PRIMARY KEY (id);
alter table public.marketing_offers add UNIQUE (ref);
alter table public.marketing_offers add UNIQUE (slug);
alter table public.package_memberships add PRIMARY KEY (id);
alter table public.amenities add PRIMARY KEY (id);
alter table public.amenities add UNIQUE (name);
alter table public.offer_amenities add PRIMARY KEY (offer_id, amenity_id);
alter table public.availability_history add PRIMARY KEY (id);
alter table public.publication_history add PRIMARY KEY (id);
alter table public.property_slug_redirects add PRIMARY KEY (id);
alter table public.property_slug_redirects add UNIQUE (old_slug);
alter table public.contacts add PRIMARY KEY (id);
alter table public.buyer_requirements add PRIMARY KEY (id);
alter table public.contact_shortlists add PRIMARY KEY (id);
alter table public.contact_shortlists add UNIQUE (contact_id, offer_id);
alter table public.enquiries add CHECK ((status = ANY (ARRAY['New'::text, 'Contacted'::text, 'Qualified'::text, 'Archived'::text])));
alter table public.enquiries add PRIMARY KEY (id);
alter table public.enquiries add UNIQUE (ref_number);
alter table public.enquiries add UNIQUE (idempotency_key);
alter table public.leads add PRIMARY KEY (id);
alter table public.tasks add CHECK ((link_kind = ANY (ARRAY['lead'::text, 'contact'::text, 'deal'::text, 'property'::text, 'viewing'::text])));
alter table public.tasks add PRIMARY KEY (id);
alter table public.viewings add PRIMARY KEY (id);
alter table public.activities add PRIMARY KEY (id);
alter table public.notes add PRIMARY KEY (id);
alter table public.contact_merges add PRIMARY KEY (id);
alter table public.deals add PRIMARY KEY (id);
alter table public.deal_selected_units add PRIMARY KEY (id);
alter table public.offer_revisions add PRIMARY KEY (id);
alter table public.reservations add CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'converted'::text, 'cancelled'::text])));
alter table public.reservations add PRIMARY KEY (id);
alter table public.document_checklists add CHECK ((status = ANY (ARRAY['pending'::text, 'uploaded'::text, 'verified'::text, 'rejected'::text])));
alter table public.document_checklists add PRIMARY KEY (id);
alter table public.payment_milestones add CHECK ((status = ANY (ARRAY['pending'::text, 'partial'::text, 'paid'::text, 'overdue'::text])));
alter table public.payment_milestones add PRIMARY KEY (id);
alter table public.recorded_payments add PRIMARY KEY (id);
alter table public.commission_allocations add CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text])));
alter table public.commission_allocations add PRIMARY KEY (id);
alter table public.leases add CHECK (((payment_due_day >= 1) AND (payment_due_day <= 31)));
alter table public.leases add CHECK ((end_date > start_date));
alter table public.leases add PRIMARY KEY (id);
alter table public.rent_charges add CHECK ((status = ANY (ARRAY['pending'::text, 'partial'::text, 'paid'::text, 'overdue'::text])));
alter table public.rent_charges add PRIMARY KEY (id);
alter table public.rent_charges add UNIQUE (lease_id, period_start);
alter table public.rent_payment_allocations add PRIMARY KEY (id);
alter table public.rental_deposits add CHECK ((status = ANY (ARRAY['held'::text, 'returned'::text, 'retained_for_repairs'::text])));
alter table public.rental_deposits add PRIMARY KEY (id);
alter table public.vendors add PRIMARY KEY (id);
alter table public.maintenance_tickets add PRIMARY KEY (id);
alter table public.site_settings add PRIMARY KEY (id);
alter table public.site_settings add UNIQUE (singleton_key);
alter table public.content_pages add PRIMARY KEY (id);
alter table public.content_pages add UNIQUE (slug);
alter table public.content_sections add PRIMARY KEY (id);
alter table public.content_sections add UNIQUE (page_id, section_key);
alter table public.services add PRIMARY KEY (id);
alter table public.services add UNIQUE (slug);
alter table public.faqs add PRIMARY KEY (id);
alter table public.catalog_documents add PRIMARY KEY (id);
alter table public.audit_events add PRIMARY KEY (id);
alter table public.notifications add PRIMARY KEY (id);
alter table public.storage_files add PRIMARY KEY (id);
alter table public.storage_files add UNIQUE (bucket, path);
alter table public.source_files add CHECK ((import_status = ANY (ARRAY['pending'::text, 'imported'::text, 'failed'::text, 'skipped'::text])));
alter table public.source_files add PRIMARY KEY (id);
alter table public.source_files add UNIQUE (drive_id);
alter table public.extraction_candidates add CHECK ((review_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text])));
alter table public.extraction_candidates add PRIMARY KEY (id);
alter table public.import_runs add PRIMARY KEY (id);
alter table public.rate_limit_entries add PRIMARY KEY (id);
alter table public.rate_limit_entries add UNIQUE (rate_key, window_start);
alter table public.offer_amenities add FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE;
alter table public.pricing_options add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.staff_profiles add FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.instalment_schedules add FOREIGN KEY (pricing_option_id) REFERENCES pricing_options(id) ON DELETE CASCADE;
alter table public.projects add FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE SET NULL;
alter table public.buildings add FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
alter table public.physical_units add FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
alter table public.physical_units add FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
alter table public.marketing_offers add FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
alter table public.marketing_offers add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE SET NULL;
alter table public.marketing_offers add FOREIGN KEY (assigned_agent_id) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.marketing_offers add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.marketing_offers add FOREIGN KEY (updated_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.package_memberships add FOREIGN KEY (package_offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.package_memberships add FOREIGN KEY (member_unit_id) REFERENCES physical_units(id) ON DELETE CASCADE;
alter table public.package_memberships add FOREIGN KEY (member_offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.offer_amenities add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.price_history add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.price_history add FOREIGN KEY (changed_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.availability_history add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.availability_history add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE CASCADE;
alter table public.availability_history add FOREIGN KEY (changed_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.publication_history add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.publication_history add FOREIGN KEY (changed_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.property_slug_redirects add FOREIGN KEY (target_offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.contacts add FOREIGN KEY (assigned_agent_id) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.contacts add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.buyer_requirements add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
alter table public.contact_shortlists add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
alter table public.contact_shortlists add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.enquiries add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE SET NULL;
alter table public.enquiries add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
alter table public.leads add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
alter table public.leads add FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL;
alter table public.leads add FOREIGN KEY (assigned_agent_id) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.leads add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.enquiries add FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
alter table public.tasks add FOREIGN KEY (assignee_id) REFERENCES staff_profiles(id) ON DELETE CASCADE;
alter table public.tasks add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.viewings add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
alter table public.viewings add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE SET NULL;
alter table public.viewings add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE SET NULL;
alter table public.viewings add FOREIGN KEY (agent_id) REFERENCES staff_profiles(id) ON DELETE CASCADE;
alter table public.viewings add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.activities add FOREIGN KEY (user_id) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.notes add FOREIGN KEY (author_id) REFERENCES staff_profiles(id) ON DELETE CASCADE;
alter table public.contact_merges add FOREIGN KEY (target_contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
alter table public.contact_merges add FOREIGN KEY (merged_by) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.deals add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT;
alter table public.deals add FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
alter table public.deals add FOREIGN KEY (assigned_agent_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.deals add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.deal_selected_units add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.deal_selected_units add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE SET NULL;
alter table public.deal_selected_units add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE SET NULL;
alter table public.offer_revisions add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.offer_revisions add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.reservations add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.reservations add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE CASCADE;
alter table public.reservations add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE CASCADE;
alter table public.reservations add FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT;
alter table public.reservations add FOREIGN KEY (reserved_by) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.document_checklists add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.document_checklists add FOREIGN KEY (verified_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.payment_milestones add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.recorded_payments add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.recorded_payments add FOREIGN KEY (milestone_id) REFERENCES payment_milestones(id) ON DELETE SET NULL;
alter table public.recorded_payments add FOREIGN KEY (reversal_for_id) REFERENCES recorded_payments(id);
alter table public.recorded_payments add FOREIGN KEY (recorded_by) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.commission_allocations add FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
alter table public.commission_allocations add FOREIGN KEY (agent_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.leases add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE RESTRICT;
alter table public.leases add FOREIGN KEY (offer_id) REFERENCES marketing_offers(id) ON DELETE SET NULL;
alter table public.leases add FOREIGN KEY (landlord_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT;
alter table public.leases add FOREIGN KEY (tenant_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT;
alter table public.leases add FOREIGN KEY (agent_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.leases add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.rent_charges add FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE;
alter table public.rent_payment_allocations add FOREIGN KEY (charge_id) REFERENCES rent_charges(id) ON DELETE CASCADE;
alter table public.rent_payment_allocations add FOREIGN KEY (recorded_payment_id) REFERENCES recorded_payments(id) ON DELETE RESTRICT;
alter table public.rent_payment_allocations add FOREIGN KEY (allocated_by) REFERENCES staff_profiles(id) ON DELETE RESTRICT;
alter table public.rental_deposits add FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE;
alter table public.maintenance_tickets add FOREIGN KEY (physical_unit_id) REFERENCES physical_units(id) ON DELETE CASCADE;
alter table public.maintenance_tickets add FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL;
alter table public.maintenance_tickets add FOREIGN KEY (requester_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
alter table public.maintenance_tickets add FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
alter table public.maintenance_tickets add FOREIGN KEY (created_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.site_settings add FOREIGN KEY (updated_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.content_pages add FOREIGN KEY (updated_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.content_sections add FOREIGN KEY (page_id) REFERENCES content_pages(id) ON DELETE CASCADE;
alter table public.audit_events add FOREIGN KEY (actor_id) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.notifications add FOREIGN KEY (recipient_id) REFERENCES staff_profiles(id) ON DELETE CASCADE;
alter table public.storage_files add FOREIGN KEY (uploaded_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.extraction_candidates add FOREIGN KEY (source_file_id) REFERENCES source_files(id) ON DELETE SET NULL;
alter table public.extraction_candidates add FOREIGN KEY (reviewed_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
alter table public.import_runs add FOREIGN KEY (initiated_by) REFERENCES staff_profiles(id) ON DELETE SET NULL;
CREATE OR REPLACE FUNCTION public.is_active_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_manager()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_agent()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'agent') AND is_active = true
  );
$function$
;
CREATE OR REPLACE FUNCTION public.check_last_admin_protection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  active_admin_count INT;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin' AND OLD.is_active = true) OR
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND OLD.is_active = true AND (NEW.role != 'admin' OR NEW.is_active = false)) THEN
    SELECT COUNT(*) INTO active_admin_count
    FROM public.staff_profiles
    WHERE role = 'admin' AND is_active = true AND id != OLD.id;

    IF active_admin_count < 1 THEN
      RAISE EXCEPTION 'Cannot demote or remove the last active administrator.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.check_lease_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  conflict_count INT;
BEGIN
  IF NEW.status = 'active' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM public.leases
    WHERE physical_unit_id = NEW.physical_unit_id
      AND status = 'active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (start_date <= NEW.end_date AND end_date >= NEW.start_date);

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Overlapping active lease already exists for physical unit %.', NEW.physical_unit_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.check_rent_allocation_currency()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  charge_curr currency_code;
  payment_curr currency_code;
BEGIN
  SELECT currency INTO charge_curr FROM public.rent_charges WHERE id = NEW.charge_id;
  SELECT currency INTO payment_curr FROM public.recorded_payments WHERE id = NEW.recorded_payment_id;

  IF charge_curr != payment_curr THEN
    RAISE EXCEPTION 'Cross-currency payment allocation rejected: charge is % but payment is %.', charge_curr, payment_curr;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.publish_offer_atomic(p_offer_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_offer public.marketing_offers%ROWTYPE;
  v_snapshot JSONB;
BEGIN
  SELECT * INTO v_offer
  FROM public.marketing_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found.', p_offer_id;
  END IF;

  IF char_length(trim(v_offer.marketing_title)) = 0 THEN
    RAISE EXCEPTION 'Title cannot be empty.';
  END IF;
  IF NOT (v_offer.slug ~ '^[a-z0-9-]+CREATE OR REPLACE FUNCTION public.unpublish_offer(p_offer_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_old_pub publication_status;
BEGIN
  SELECT publication INTO v_old_pub
  FROM public.marketing_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found.', p_offer_id;
  END IF;

  INSERT INTO public.publication_history (
    offer_id, old_status, new_status, changed_by, reason
  ) VALUES (
    p_offer_id, v_old_pub, 'Draft', p_user_id, 'Unpublished to Draft'
  );

  UPDATE public.marketing_offers
  SET publication = 'Draft',
      version = version + 1,
      updated_by = p_user_id,
      updated_at = now()
  WHERE id = p_offer_id;

  INSERT INTO public.audit_events (
    actor_id, action, target_table, target_id
  ) VALUES (
    p_user_id, 'UNPUBLISH_OFFER', 'marketing_offers', p_offer_id
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_reservation_atomic(p_deal_id uuid, p_offer_id uuid, p_unit_id uuid, p_contact_id uuid, p_user_id uuid, p_deposit numeric, p_currency currency_code, p_duration_hours integer DEFAULT 72)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_res_id UUID;
  v_unit_status property_availability;
  v_offer_avail property_availability;
BEGIN
  IF p_unit_id IS NOT NULL THEN
    SELECT status INTO v_unit_status
    FROM public.physical_units
    WHERE id = p_unit_id
    FOR UPDATE;

    IF v_unit_status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Physical unit % is not available (status: %).', p_unit_id, v_unit_status;
    END IF;

    IF EXISTS (SELECT 1 FROM public.reservations WHERE physical_unit_id = p_unit_id AND status = 'active' AND expires_at > now()) THEN
      RAISE EXCEPTION 'Physical unit % already has an active reservation.', p_unit_id;
    END IF;

    UPDATE public.physical_units
    SET status = 'Reserved', updated_at = now()
    WHERE id = p_unit_id;

    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (p_unit_id, v_unit_status, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  IF p_offer_id IS NOT NULL THEN
    SELECT availability INTO v_offer_avail
    FROM public.marketing_offers
    WHERE id = p_offer_id
    FOR UPDATE;

    IF v_offer_avail IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Marketing offer % is not available (status: %).', p_offer_id, v_offer_avail;
    END IF;

    UPDATE public.marketing_offers
    SET availability = 'Reserved', updated_at = now()
    WHERE id = p_offer_id;

    INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
    VALUES (p_offer_id, v_offer_avail, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  INSERT INTO public.reservations (
    deal_id, offer_id, physical_unit_id, contact_id, reserved_by,
    deposit_amount, deposit_currency, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_offer_id, p_unit_id, p_contact_id, p_user_id,
    p_deposit, p_currency, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  )
  RETURNING id INTO v_res_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'CREATE_RESERVATION', 'reservations', v_res_id);

  RETURN v_res_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_deal_win(p_deal_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_selected RECORD;
BEGIN
  PERFORM 1 FROM public.deals WHERE id = p_deal_id FOR UPDATE;

  FOR v_selected IN (
    SELECT dsu.physical_unit_id, dsu.offer_id
    FROM public.deal_selected_units dsu
    WHERE dsu.deal_id = p_deal_id
  ) LOOP
    IF v_selected.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Sold', updated_at = now()
      WHERE id = v_selected.physical_unit_id;

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.physical_unit_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;

    IF v_selected.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Sold', updated_at = now()
      WHERE id = v_selected.offer_id;

      INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.offer_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;
  END LOOP;

  UPDATE public.reservations
  SET status = 'converted', updated_at = now()
  WHERE deal_id = p_deal_id AND status = 'active';

  UPDATE public.deals
  SET stage = 'Won',
      actual_close_date = now(),
      version = version + 1,
      updated_at = now()
  WHERE id = p_deal_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'COMPLETE_DEAL_WIN', 'deals', p_deal_id);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reserve_package_atomic(p_deal_id uuid, p_package_offer_id uuid, p_contact_id uuid, p_user_id uuid, p_duration_hours integer DEFAULT 72)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_res_id UUID;
  v_member RECORD;
BEGIN
  PERFORM 1 FROM public.marketing_offers WHERE id = p_package_offer_id FOR UPDATE;

  FOR v_member IN (
    SELECT pm.member_unit_id, u.status
    FROM public.package_memberships pm
    JOIN public.physical_units u ON u.id = pm.member_unit_id
    WHERE pm.package_offer_id = p_package_offer_id
    FOR UPDATE OF u
  ) LOOP
    IF v_member.status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Constituent unit % is not available (status: %).', v_member.member_unit_id, v_member.status;
    END IF;
  END LOOP;

  FOR v_member IN (
    SELECT member_unit_id FROM public.package_memberships WHERE package_offer_id = p_package_offer_id
  ) LOOP
    UPDATE public.physical_units SET status = 'Reserved', updated_at = now() WHERE id = v_member.member_unit_id;
    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (v_member.member_unit_id, 'Available', 'Reserved', p_user_id, 'Package reservation constituent');
  END LOOP;

  UPDATE public.marketing_offers SET availability = 'Reserved', updated_at = now() WHERE id = p_package_offer_id;

  INSERT INTO public.reservations (
    deal_id, offer_id, contact_id, reserved_by, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_package_offer_id, p_contact_id, p_user_id, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  ) RETURNING id INTO v_res_id;

  RETURN v_res_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.convert_enquiry_to_lead(p_enquiry_id uuid, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_enq public.enquiries%ROWTYPE;
  v_contact_id UUID;
  v_lead_id UUID;
  v_budget_num NUMERIC;
BEGIN
  SELECT * INTO v_enq FROM public.enquiries WHERE id = p_enquiry_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquiry % not found.', p_enquiry_id;
  END IF;

  IF v_enq.lead_id IS NOT NULL THEN
    RETURN v_enq.lead_id;
  END IF;

  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE (lower(email) = lower(v_enq.email) AND email IS NOT NULL)
     OR (phone = v_enq.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (
      name, email, phone, kind, roles, language, notes, created_by
    ) VALUES (
      v_enq.name, v_enq.email, v_enq.phone, 'person', '{"buyer"}', 'English',
      'Converted from enquiry ' || v_enq.ref_number || ': ' || v_enq.topic, p_user_id
    ) RETURNING id INTO v_contact_id;
  END IF;

  BEGIN
    v_budget_num := NULLIF(regexp_replace(v_enq.budget, '[^0-9.]', '', 'g'), '')::NUMERIC;
  EXCEPTION
    WHEN OTHERS THEN v_budget_num := NULL;
  END;

  INSERT INTO public.leads (
    contact_id, enquiry_id, source, assigned_agent_id,
    budget_min, budget_max, currency, stage, shortlist, created_by
  ) VALUES (
    v_contact_id, v_enq.id, v_enq.source, p_user_id,
    CASE WHEN v_budget_num IS NOT NULL THEN v_budget_num * 0.8 ELSE NULL END,
    v_budget_num, 'USD', 'Qualified',
    CASE WHEN v_enq.offer_id IS NOT NULL THEN ARRAY[v_enq.offer_id] ELSE '{}' END,
    p_user_id
  ) RETURNING id INTO v_lead_id;

  UPDATE public.enquiries
  SET lead_id = v_lead_id, contact_id = v_contact_id, status = 'Qualified', updated_at = now()
  WHERE id = p_enquiry_id;

  INSERT INTO public.activities (user_id, kind, text, ref_kind, ref_id)
  VALUES (p_user_id, 'lead', 'Enquiry ' || v_enq.ref_number || ' converted to lead', 'leads', v_lead_id);

  RETURN v_lead_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_current_staff_role()
 RETURNS staff_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT role FROM public.staff_profiles
  WHERE id = auth.uid() AND is_active = true;
$function$
;
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_count INT := 0;
  v_res RECORD;
BEGIN
  FOR v_res IN (
    SELECT id, offer_id, physical_unit_id
    FROM public.reservations
    WHERE status = 'active' AND expires_at < now()
    FOR UPDATE
  ) LOOP
    UPDATE public.reservations
    SET status = 'expired', updated_at = now()
    WHERE id = v_res.id;

    IF v_res.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Available', updated_at = now()
      WHERE id = v_res.physical_unit_id AND status = 'Reserved';

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, reason)
      VALUES (v_res.physical_unit_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    IF v_res.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Available', updated_at = now()
      WHERE id = v_res.offer_id AND availability = 'Reserved';

      INSERT INTO public.availability_history (offer_id, old_status, new_status, reason)
      VALUES (v_res.offer_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_rent_charges_for_month(p_year integer, p_month integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_count INT := 0;
  v_lease RECORD;
  v_period_start DATE;
  v_period_end DATE;
  v_days_in_month INT;
  v_due_day INT;
  v_due_date DATE;
BEGIN
  v_period_start := make_date(p_year, p_month, 1);
  v_days_in_month := EXTRACT(DAY FROM (v_period_start + interval '1 month - 1 day'));
  v_period_end := make_date(p_year, p_month, v_days_in_month);

  FOR v_lease IN (
    SELECT id, rent_amount, rent_currency, payment_due_day
    FROM public.leases
    WHERE status = 'active'
      AND start_date <= v_period_end
      AND end_date >= v_period_start
  ) LOOP
    v_due_day := LEAST(v_lease.payment_due_day, v_days_in_month);
    v_due_date := make_date(p_year, p_month, v_due_day);

    INSERT INTO public.rent_charges (
      lease_id, period_start, period_end, due_date, charge_amount, currency, status
    ) VALUES (
      v_lease.id, v_period_start, v_period_end, v_due_date, v_lease.rent_amount, v_lease.rent_currency, 'pending'
    )
    ON CONFLICT (lease_id, period_start) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$
;
CREATE TRIGGER trg_staff_profiles_last_admin BEFORE DELETE OR UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION check_last_admin_protection();
CREATE TRIGGER trg_leases_overlap_check BEFORE INSERT OR UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION check_lease_overlap();
CREATE TRIGGER trg_rent_alloc_currency_check BEFORE INSERT OR UPDATE ON public.rent_payment_allocations FOR EACH ROW EXECUTE FUNCTION check_rent_allocation_currency();
create policy "staff_read_profiles" on public.staff_profiles as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "admin_manage_staff" on public.staff_profiles as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "public_read_site_settings" on public.site_settings as PERMISSIVE for SELECT to public using(true);
create policy "public_read_published_offers" on public.marketing_offers as PERMISSIVE for SELECT to public using(((publication = 'Published'::publication_status) OR is_active_staff()));
create policy "public_read_pricing_options" on public.pricing_options as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM marketing_offers
  WHERE ((marketing_offers.id = pricing_options.offer_id) AND ((marketing_offers.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_instalment_schedules" on public.instalment_schedules as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM (pricing_options po
     JOIN marketing_offers mo ON ((mo.id = po.offer_id)))
  WHERE ((po.id = instalment_schedules.pricing_option_id) AND ((mo.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_projects" on public.projects as PERMISSIVE for SELECT to public using(true);
create policy "public_read_developers" on public.developers as PERMISSIVE for SELECT to public using(true);
create policy "public_read_amenities" on public.amenities as PERMISSIVE for SELECT to public using(true);
create policy "public_read_offer_amenities" on public.offer_amenities as PERMISSIVE for SELECT to public using(true);
create policy "public_read_package_memberships" on public.package_memberships as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM marketing_offers
  WHERE ((marketing_offers.id = package_memberships.package_offer_id) AND ((marketing_offers.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_redirects" on public.property_slug_redirects as PERMISSIVE for SELECT to public using(true);
create policy "public_read_content_pages" on public.content_pages as PERMISSIVE for SELECT to public using(((published_status = 'Published'::publication_status) OR is_active_staff()));
create policy "manager_manage_pricing" on public.pricing_options as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "public_read_content_sections" on public.content_sections as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM content_pages
  WHERE ((content_pages.id = content_sections.page_id) AND ((content_pages.published_status = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_services" on public.services as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_read_faqs" on public.faqs as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_read_catalog_documents" on public.catalog_documents as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_insert_enquiry" on public.enquiries as PERMISSIVE for INSERT to public with check(((char_length(name) >= 2) AND (char_length(email) >= 5) AND (char_length(phone) >= 7) AND (char_length(message) >= 5) AND (status = 'New'::text) AND (lead_id IS NULL) AND (contact_id IS NULL)));
create policy "staff_read_enquiries" on public.enquiries as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_enquiries" on public.enquiries as PERMISSIVE for UPDATE to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM leads l
  WHERE ((l.enquiry_id = enquiries.id) AND (l.assigned_agent_id = auth.uid())))))));
create policy "staff_manage_inventory_managers" on public.marketing_offers as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "agent_update_own_offers" on public.marketing_offers as PERMISSIVE for UPDATE to public using((is_agent() AND (assigned_agent_id = auth.uid()))) with check((is_agent() AND (assigned_agent_id = auth.uid())));
create policy "manager_manage_schedules" on public.instalment_schedules as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_units" on public.physical_units as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_units" on public.physical_units as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_buildings" on public.buildings as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_buildings" on public.buildings as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_projects" on public.projects as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_developers" on public.developers as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_amenities" on public.amenities as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_offer_amenities" on public.offer_amenities as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_packages" on public.package_memberships as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_history" on public.price_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_avail_history" on public.availability_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_publ_history" on public.publication_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_redirects" on public.property_slug_redirects as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_contacts" on public.contacts as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_contacts" on public.contacts as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid())))));
create policy "staff_read_leads" on public.leads as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_reservations" on public.reservations as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_manage_checklists" on public.document_checklists as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_manage_leads" on public.leads as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid())))));
create policy "staff_read_buyer_reqs" on public.buyer_requirements as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_buyer_reqs" on public.buyer_requirements as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_read_shortlists" on public.contact_shortlists as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_shortlists" on public.contact_shortlists as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_read_tasks" on public.tasks as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_tasks" on public.tasks as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assignee_id = auth.uid()) OR (created_by = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assignee_id = auth.uid()) OR (created_by = auth.uid())))));
create policy "staff_read_viewings" on public.viewings as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_viewings" on public.viewings as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (agent_id = auth.uid())))) with check((is_manager() OR (is_agent() AND (agent_id = auth.uid()))));
create policy "staff_read_activities" on public.activities as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_insert_activities" on public.activities as PERMISSIVE for INSERT to public with check(is_active_staff());
create policy "staff_manage_milestones" on public.payment_milestones as PERMISSIVE for ALL to public using(is_manager());
create policy "staff_read_payments" on public.recorded_payments as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_notes" on public.notes as PERMISSIVE for SELECT to public using((is_active_staff() AND ((NOT is_private) OR (author_id = auth.uid()) OR is_admin())));
create policy "staff_manage_notes" on public.notes as PERMISSIVE for ALL to public using(((author_id = auth.uid()) OR is_admin())) with check(((author_id = auth.uid()) OR is_admin()));
create policy "staff_manage_merges" on public.contact_merges as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_deals" on public.deals as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_deals" on public.deals as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (assigned_agent_id = auth.uid())))) with check((is_manager() OR (is_agent() AND (assigned_agent_id = auth.uid()))));
create policy "staff_manage_selected_units" on public.deal_selected_units as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM deals
  WHERE ((deals.id = deal_selected_units.deal_id) AND (deals.assigned_agent_id = auth.uid())))))));
create policy "staff_manage_revisions" on public.offer_revisions as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM deals
  WHERE ((deals.id = offer_revisions.deal_id) AND (deals.assigned_agent_id = auth.uid())))))));
create policy "manager_manage_payments" on public.recorded_payments as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_commissions" on public.commission_allocations as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "agent_read_own_commissions" on public.commission_allocations as PERMISSIVE for SELECT to public using((agent_id = auth.uid()));
create policy "staff_read_leases" on public.leases as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_leases" on public.leases as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_charges" on public.rent_charges as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_charges" on public.rent_charges as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_allocations" on public.rent_payment_allocations as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_deposits" on public.rental_deposits as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_vendors" on public.vendors as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_vendors" on public.vendors as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_manage_tickets" on public.maintenance_tickets as PERMISSIVE for ALL to public using(is_agent());
create policy "manager_manage_settings" on public.site_settings as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_pages" on public.content_pages as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_sections" on public.content_sections as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_services" on public.services as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_faqs" on public.faqs as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_catalog" on public.catalog_documents as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_audit" on public.audit_events as PERMISSIVE for SELECT to public using(is_manager());
create policy "staff_read_own_notifications" on public.notifications as PERMISSIVE for SELECT to public using((recipient_id = auth.uid()));
create policy "staff_update_own_notifications" on public.notifications as PERMISSIVE for UPDATE to public using((recipient_id = auth.uid())) with check((recipient_id = auth.uid()));
create policy "staff_manage_storage_files" on public.storage_files as PERMISSIVE for ALL to public using(is_active_staff());
create policy "admin_manage_source_files" on public.source_files as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "admin_manage_candidates" on public.extraction_candidates as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "admin_manage_import_runs" on public.import_runs as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "rate_limit_policy" on public.rate_limit_entries as PERMISSIVE for ALL to public using(true) with check(true);
create policy "public_view_marketing_media" on storage.objects as PERMISSIVE for SELECT to public using((bucket_id = 'public-marketing'::text));
create policy "staff_manage_marketing_media" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'public-marketing'::text) AND is_active_staff())) with check(((bucket_id = 'public-marketing'::text) AND is_active_staff()));
create policy "staff_view_source_media" on storage.objects as PERMISSIVE for SELECT to public using(((bucket_id = 'private-source'::text) AND is_active_staff()));
create policy "admin_manage_source_media" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'private-source'::text) AND is_admin())) with check(((bucket_id = 'private-source'::text) AND is_admin()));
create policy "staff_view_documents" on storage.objects as PERMISSIVE for SELECT to public using(((bucket_id = 'private-documents'::text) AND is_active_staff()));
create policy "agent_manage_documents" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'private-documents'::text) AND is_agent())) with check(((bucket_id = 'private-documents'::text) AND is_agent()));
) THEN
    RAISE EXCEPTION 'Slug must contain only lowercase alphanumeric characters and hyphens.';
  END IF;
  IF char_length(trim(v_offer.district)) = 0 THEN
    RAISE EXCEPTION 'District / location cannot be empty.';
  END IF;
  IF v_offer.price_type != 'on-request' AND (v_offer.amount IS NULL OR v_offer.currency IS NULL) THEN
    RAISE EXCEPTION 'Price amount and currency must be specified unless marked on-request.';
  END IF;

  v_snapshot := jsonb_build_object(
    'id', v_offer.id,
    'ref', v_offer.ref,
    'slug', v_offer.slug,
    'marketing_title', v_offer.marketing_title,
    'record_type', v_offer.record_type,
    'mode', v_offer.mode,
    'layout_label', v_offer.layout_label,
    'bathrooms', v_offer.bathrooms,
    'district', v_offer.district,
    'city', v_offer.city,
    'side', v_offer.side,
    'tapu_status', v_offer.tapu_status,
    'gross_m2', v_offer.gross_m2,
    'net_m2', v_offer.net_m2,
    'area_m2', v_offer.area_m2,
    'amount', v_offer.amount,
    'currency', v_offer.currency,
    'price_type', v_offer.price_type,
    'price_basis', v_offer.price_basis,
    'expenses_amount', v_offer.expenses_amount,
    'availability', v_offer.availability,
    'cover_image_path', v_offer.cover_image_path,
    'description', v_offer.description,
    'source_note', v_offer.source_note,
    'claims_requiring_confirmation', v_offer.claims_requiring_confirmation,
    'cbi_eligible', v_offer.cbi_eligible,
    'version', v_offer.version + 1,
    'published_at', now()
  );

  INSERT INTO public.publication_history (
    offer_id, old_status, new_status, snapshot, changed_by, reason
  ) VALUES (
    v_offer.id, v_offer.publication, 'Published', v_snapshot, p_user_id, 'Atomic publication'
  );

  UPDATE public.marketing_offers
  SET publication = 'Published',
      published_snapshot = v_snapshot,
      published_at = now(),
      version = version + 1,
      updated_by = p_user_id,
      updated_at = now()
  WHERE id = p_offer_id;

  INSERT INTO public.audit_events (
    actor_id, actor_role, action, target_table, target_id, new_values
  ) VALUES (
    p_user_id, 'manager', 'PUBLISH_OFFER', 'marketing_offers', p_offer_id, v_snapshot
  );

  RETURN v_snapshot;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.unpublish_offer(p_offer_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_old_pub publication_status;
BEGIN
  SELECT publication INTO v_old_pub
  FROM public.marketing_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found.', p_offer_id;
  END IF;

  INSERT INTO public.publication_history (
    offer_id, old_status, new_status, changed_by, reason
  ) VALUES (
    p_offer_id, v_old_pub, 'Draft', p_user_id, 'Unpublished to Draft'
  );

  UPDATE public.marketing_offers
  SET publication = 'Draft',
      version = version + 1,
      updated_by = p_user_id,
      updated_at = now()
  WHERE id = p_offer_id;

  INSERT INTO public.audit_events (
    actor_id, action, target_table, target_id
  ) VALUES (
    p_user_id, 'UNPUBLISH_OFFER', 'marketing_offers', p_offer_id
  );
END;
$function$

CREATE OR REPLACE FUNCTION public.create_reservation_atomic(p_deal_id uuid, p_offer_id uuid, p_unit_id uuid, p_contact_id uuid, p_user_id uuid, p_deposit numeric, p_currency currency_code, p_duration_hours integer DEFAULT 72)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_res_id UUID;
  v_unit_status property_availability;
  v_offer_avail property_availability;
BEGIN
  IF p_unit_id IS NOT NULL THEN
    SELECT status INTO v_unit_status
    FROM public.physical_units
    WHERE id = p_unit_id
    FOR UPDATE;

    IF v_unit_status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Physical unit % is not available (status: %).', p_unit_id, v_unit_status;
    END IF;

    IF EXISTS (SELECT 1 FROM public.reservations WHERE physical_unit_id = p_unit_id AND status = 'active' AND expires_at > now()) THEN
      RAISE EXCEPTION 'Physical unit % already has an active reservation.', p_unit_id;
    END IF;

    UPDATE public.physical_units
    SET status = 'Reserved', updated_at = now()
    WHERE id = p_unit_id;

    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (p_unit_id, v_unit_status, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  IF p_offer_id IS NOT NULL THEN
    SELECT availability INTO v_offer_avail
    FROM public.marketing_offers
    WHERE id = p_offer_id
    FOR UPDATE;

    IF v_offer_avail IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Marketing offer % is not available (status: %).', p_offer_id, v_offer_avail;
    END IF;

    UPDATE public.marketing_offers
    SET availability = 'Reserved', updated_at = now()
    WHERE id = p_offer_id;

    INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
    VALUES (p_offer_id, v_offer_avail, 'Reserved', p_user_id, 'Reservation created');
  END IF;

  INSERT INTO public.reservations (
    deal_id, offer_id, physical_unit_id, contact_id, reserved_by,
    deposit_amount, deposit_currency, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_offer_id, p_unit_id, p_contact_id, p_user_id,
    p_deposit, p_currency, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  )
  RETURNING id INTO v_res_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'CREATE_RESERVATION', 'reservations', v_res_id);

  RETURN v_res_id;
END;
$function$

CREATE OR REPLACE FUNCTION public.complete_deal_win(p_deal_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_selected RECORD;
BEGIN
  PERFORM 1 FROM public.deals WHERE id = p_deal_id FOR UPDATE;

  FOR v_selected IN (
    SELECT dsu.physical_unit_id, dsu.offer_id
    FROM public.deal_selected_units dsu
    WHERE dsu.deal_id = p_deal_id
  ) LOOP
    IF v_selected.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Sold', updated_at = now()
      WHERE id = v_selected.physical_unit_id;

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.physical_unit_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;

    IF v_selected.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Sold', updated_at = now()
      WHERE id = v_selected.offer_id;

      INSERT INTO public.availability_history (offer_id, old_status, new_status, changed_by, reason)
      VALUES (v_selected.offer_id, 'Reserved', 'Sold', p_user_id, 'Deal won');
    END IF;
  END LOOP;

  UPDATE public.reservations
  SET status = 'converted', updated_at = now()
  WHERE deal_id = p_deal_id AND status = 'active';

  UPDATE public.deals
  SET stage = 'Won',
      actual_close_date = now(),
      version = version + 1,
      updated_at = now()
  WHERE id = p_deal_id;

  INSERT INTO public.audit_events (actor_id, action, target_table, target_id)
  VALUES (p_user_id, 'COMPLETE_DEAL_WIN', 'deals', p_deal_id);
END;
$function$

CREATE OR REPLACE FUNCTION public.reserve_package_atomic(p_deal_id uuid, p_package_offer_id uuid, p_contact_id uuid, p_user_id uuid, p_duration_hours integer DEFAULT 72)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_res_id UUID;
  v_member RECORD;
BEGIN
  PERFORM 1 FROM public.marketing_offers WHERE id = p_package_offer_id FOR UPDATE;

  FOR v_member IN (
    SELECT pm.member_unit_id, u.status
    FROM public.package_memberships pm
    JOIN public.physical_units u ON u.id = pm.member_unit_id
    WHERE pm.package_offer_id = p_package_offer_id
    FOR UPDATE OF u
  ) LOOP
    IF v_member.status IN ('Reserved', 'Sold', 'Rented') THEN
      RAISE EXCEPTION 'Constituent unit % is not available (status: %).', v_member.member_unit_id, v_member.status;
    END IF;
  END LOOP;

  FOR v_member IN (
    SELECT member_unit_id FROM public.package_memberships WHERE package_offer_id = p_package_offer_id
  ) LOOP
    UPDATE public.physical_units SET status = 'Reserved', updated_at = now() WHERE id = v_member.member_unit_id;
    INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, changed_by, reason)
    VALUES (v_member.member_unit_id, 'Available', 'Reserved', p_user_id, 'Package reservation constituent');
  END LOOP;

  UPDATE public.marketing_offers SET availability = 'Reserved', updated_at = now() WHERE id = p_package_offer_id;

  INSERT INTO public.reservations (
    deal_id, offer_id, contact_id, reserved_by, reserved_from, expires_at, status
  ) VALUES (
    p_deal_id, p_package_offer_id, p_contact_id, p_user_id, now(), now() + (p_duration_hours || ' hours')::interval, 'active'
  ) RETURNING id INTO v_res_id;

  RETURN v_res_id;
END;
$function$

CREATE OR REPLACE FUNCTION public.convert_enquiry_to_lead(p_enquiry_id uuid, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_enq public.enquiries%ROWTYPE;
  v_contact_id UUID;
  v_lead_id UUID;
  v_budget_num NUMERIC;
BEGIN
  SELECT * INTO v_enq FROM public.enquiries WHERE id = p_enquiry_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enquiry % not found.', p_enquiry_id;
  END IF;

  IF v_enq.lead_id IS NOT NULL THEN
    RETURN v_enq.lead_id;
  END IF;

  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE (lower(email) = lower(v_enq.email) AND email IS NOT NULL)
     OR (phone = v_enq.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (
      name, email, phone, kind, roles, language, notes, created_by
    ) VALUES (
      v_enq.name, v_enq.email, v_enq.phone, 'person', '{"buyer"}', 'English',
      'Converted from enquiry ' || v_enq.ref_number || ': ' || v_enq.topic, p_user_id
    ) RETURNING id INTO v_contact_id;
  END IF;

  BEGIN
    v_budget_num := NULLIF(regexp_replace(v_enq.budget, '[^0-9.]', '', 'g'), '')::NUMERIC;
  EXCEPTION
    WHEN OTHERS THEN v_budget_num := NULL;
  END;

  INSERT INTO public.leads (
    contact_id, enquiry_id, source, assigned_agent_id,
    budget_min, budget_max, currency, stage, shortlist, created_by
  ) VALUES (
    v_contact_id, v_enq.id, v_enq.source, p_user_id,
    CASE WHEN v_budget_num IS NOT NULL THEN v_budget_num * 0.8 ELSE NULL END,
    v_budget_num, 'USD', 'Qualified',
    CASE WHEN v_enq.offer_id IS NOT NULL THEN ARRAY[v_enq.offer_id] ELSE '{}' END,
    p_user_id
  ) RETURNING id INTO v_lead_id;

  UPDATE public.enquiries
  SET lead_id = v_lead_id, contact_id = v_contact_id, status = 'Qualified', updated_at = now()
  WHERE id = p_enquiry_id;

  INSERT INTO public.activities (user_id, kind, text, ref_kind, ref_id)
  VALUES (p_user_id, 'lead', 'Enquiry ' || v_enq.ref_number || ' converted to lead', 'leads', v_lead_id);

  RETURN v_lead_id;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_current_staff_role()
 RETURNS staff_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT role FROM public.staff_profiles
  WHERE id = auth.uid() AND is_active = true;
$function$

CREATE OR REPLACE FUNCTION public.release_expired_reservations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_count INT := 0;
  v_res RECORD;
BEGIN
  FOR v_res IN (
    SELECT id, offer_id, physical_unit_id
    FROM public.reservations
    WHERE status = 'active' AND expires_at < now()
    FOR UPDATE
  ) LOOP
    UPDATE public.reservations
    SET status = 'expired', updated_at = now()
    WHERE id = v_res.id;

    IF v_res.physical_unit_id IS NOT NULL THEN
      UPDATE public.physical_units
      SET status = 'Available', updated_at = now()
      WHERE id = v_res.physical_unit_id AND status = 'Reserved';

      INSERT INTO public.availability_history (physical_unit_id, old_status, new_status, reason)
      VALUES (v_res.physical_unit_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    IF v_res.offer_id IS NOT NULL THEN
      UPDATE public.marketing_offers
      SET availability = 'Available', updated_at = now()
      WHERE id = v_res.offer_id AND availability = 'Reserved';

      INSERT INTO public.availability_history (offer_id, old_status, new_status, reason)
      VALUES (v_res.offer_id, 'Reserved', 'Available', 'Automatic reservation expiration');
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$function$

CREATE OR REPLACE FUNCTION public.generate_rent_charges_for_month(p_year integer, p_month integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_count INT := 0;
  v_lease RECORD;
  v_period_start DATE;
  v_period_end DATE;
  v_days_in_month INT;
  v_due_day INT;
  v_due_date DATE;
BEGIN
  v_period_start := make_date(p_year, p_month, 1);
  v_days_in_month := EXTRACT(DAY FROM (v_period_start + interval '1 month - 1 day'));
  v_period_end := make_date(p_year, p_month, v_days_in_month);

  FOR v_lease IN (
    SELECT id, rent_amount, rent_currency, payment_due_day
    FROM public.leases
    WHERE status = 'active'
      AND start_date <= v_period_end
      AND end_date >= v_period_start
  ) LOOP
    v_due_day := LEAST(v_lease.payment_due_day, v_days_in_month);
    v_due_date := make_date(p_year, p_month, v_due_day);

    INSERT INTO public.rent_charges (
      lease_id, period_start, period_end, due_date, charge_amount, currency, status
    ) VALUES (
      v_lease.id, v_period_start, v_period_end, v_due_date, v_lease.rent_amount, v_lease.rent_currency, 'pending'
    )
    ON CONFLICT (lease_id, period_start) DO NOTHING;

    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$function$

CREATE TRIGGER trg_staff_profiles_last_admin BEFORE DELETE OR UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION check_last_admin_protection();
CREATE TRIGGER trg_leases_overlap_check BEFORE INSERT OR UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION check_lease_overlap();
CREATE TRIGGER trg_rent_alloc_currency_check BEFORE INSERT OR UPDATE ON public.rent_payment_allocations FOR EACH ROW EXECUTE FUNCTION check_rent_allocation_currency();
create policy "staff_read_profiles" on public.staff_profiles as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "admin_manage_staff" on public.staff_profiles as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "public_read_site_settings" on public.site_settings as PERMISSIVE for SELECT to public using(true);
create policy "public_read_published_offers" on public.marketing_offers as PERMISSIVE for SELECT to public using(((publication = 'Published'::publication_status) OR is_active_staff()));
create policy "public_read_pricing_options" on public.pricing_options as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM marketing_offers
  WHERE ((marketing_offers.id = pricing_options.offer_id) AND ((marketing_offers.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_instalment_schedules" on public.instalment_schedules as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM (pricing_options po
     JOIN marketing_offers mo ON ((mo.id = po.offer_id)))
  WHERE ((po.id = instalment_schedules.pricing_option_id) AND ((mo.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_projects" on public.projects as PERMISSIVE for SELECT to public using(true);
create policy "public_read_developers" on public.developers as PERMISSIVE for SELECT to public using(true);
create policy "public_read_amenities" on public.amenities as PERMISSIVE for SELECT to public using(true);
create policy "public_read_offer_amenities" on public.offer_amenities as PERMISSIVE for SELECT to public using(true);
create policy "public_read_package_memberships" on public.package_memberships as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM marketing_offers
  WHERE ((marketing_offers.id = package_memberships.package_offer_id) AND ((marketing_offers.publication = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_redirects" on public.property_slug_redirects as PERMISSIVE for SELECT to public using(true);
create policy "public_read_content_pages" on public.content_pages as PERMISSIVE for SELECT to public using(((published_status = 'Published'::publication_status) OR is_active_staff()));
create policy "manager_manage_pricing" on public.pricing_options as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "public_read_content_sections" on public.content_sections as PERMISSIVE for SELECT to public using((EXISTS ( SELECT 1
   FROM content_pages
  WHERE ((content_pages.id = content_sections.page_id) AND ((content_pages.published_status = 'Published'::publication_status) OR is_active_staff())))));
create policy "public_read_services" on public.services as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_read_faqs" on public.faqs as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_read_catalog_documents" on public.catalog_documents as PERMISSIVE for SELECT to public using(((is_published = true) OR is_active_staff()));
create policy "public_insert_enquiry" on public.enquiries as PERMISSIVE for INSERT to public with check(((char_length(name) >= 2) AND (char_length(email) >= 5) AND (char_length(phone) >= 7) AND (char_length(message) >= 5) AND (status = 'New'::text) AND (lead_id IS NULL) AND (contact_id IS NULL)));
create policy "staff_read_enquiries" on public.enquiries as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_enquiries" on public.enquiries as PERMISSIVE for UPDATE to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM leads l
  WHERE ((l.enquiry_id = enquiries.id) AND (l.assigned_agent_id = auth.uid())))))));
create policy "staff_manage_inventory_managers" on public.marketing_offers as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "agent_update_own_offers" on public.marketing_offers as PERMISSIVE for UPDATE to public using((is_agent() AND (assigned_agent_id = auth.uid()))) with check((is_agent() AND (assigned_agent_id = auth.uid())));
create policy "manager_manage_schedules" on public.instalment_schedules as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_units" on public.physical_units as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_units" on public.physical_units as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_buildings" on public.buildings as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_buildings" on public.buildings as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_projects" on public.projects as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_developers" on public.developers as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_amenities" on public.amenities as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_offer_amenities" on public.offer_amenities as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_packages" on public.package_memberships as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_history" on public.price_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_avail_history" on public.availability_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_publ_history" on public.publication_history as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_redirects" on public.property_slug_redirects as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_contacts" on public.contacts as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_contacts" on public.contacts as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid())))));
create policy "staff_read_leads" on public.leads as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_reservations" on public.reservations as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_manage_checklists" on public.document_checklists as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_manage_leads" on public.leads as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assigned_agent_id IS NULL) OR (assigned_agent_id = auth.uid())))));
create policy "staff_read_buyer_reqs" on public.buyer_requirements as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_buyer_reqs" on public.buyer_requirements as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_read_shortlists" on public.contact_shortlists as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_shortlists" on public.contact_shortlists as PERMISSIVE for ALL to public using(is_agent());
create policy "staff_read_tasks" on public.tasks as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_tasks" on public.tasks as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND ((assignee_id = auth.uid()) OR (created_by = auth.uid()))))) with check((is_manager() OR (is_agent() AND ((assignee_id = auth.uid()) OR (created_by = auth.uid())))));
create policy "staff_read_viewings" on public.viewings as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_viewings" on public.viewings as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (agent_id = auth.uid())))) with check((is_manager() OR (is_agent() AND (agent_id = auth.uid()))));
create policy "staff_read_activities" on public.activities as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_insert_activities" on public.activities as PERMISSIVE for INSERT to public with check(is_active_staff());
create policy "staff_manage_milestones" on public.payment_milestones as PERMISSIVE for ALL to public using(is_manager());
create policy "staff_read_payments" on public.recorded_payments as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_read_notes" on public.notes as PERMISSIVE for SELECT to public using((is_active_staff() AND ((NOT is_private) OR (author_id = auth.uid()) OR is_admin())));
create policy "staff_manage_notes" on public.notes as PERMISSIVE for ALL to public using(((author_id = auth.uid()) OR is_admin())) with check(((author_id = auth.uid()) OR is_admin()));
create policy "staff_manage_merges" on public.contact_merges as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_deals" on public.deals as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "staff_manage_deals" on public.deals as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (assigned_agent_id = auth.uid())))) with check((is_manager() OR (is_agent() AND (assigned_agent_id = auth.uid()))));
create policy "staff_manage_selected_units" on public.deal_selected_units as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM deals
  WHERE ((deals.id = deal_selected_units.deal_id) AND (deals.assigned_agent_id = auth.uid())))))));
create policy "staff_manage_revisions" on public.offer_revisions as PERMISSIVE for ALL to public using((is_manager() OR (is_agent() AND (EXISTS ( SELECT 1
   FROM deals
  WHERE ((deals.id = offer_revisions.deal_id) AND (deals.assigned_agent_id = auth.uid())))))));
create policy "manager_manage_payments" on public.recorded_payments as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_commissions" on public.commission_allocations as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "agent_read_own_commissions" on public.commission_allocations as PERMISSIVE for SELECT to public using((agent_id = auth.uid()));
create policy "staff_read_leases" on public.leases as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_leases" on public.leases as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_charges" on public.rent_charges as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_charges" on public.rent_charges as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_allocations" on public.rent_payment_allocations as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_deposits" on public.rental_deposits as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_vendors" on public.vendors as PERMISSIVE for SELECT to public using(is_active_staff());
create policy "manager_manage_vendors" on public.vendors as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_manage_tickets" on public.maintenance_tickets as PERMISSIVE for ALL to public using(is_agent());
create policy "manager_manage_settings" on public.site_settings as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_pages" on public.content_pages as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_sections" on public.content_sections as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_services" on public.services as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_faqs" on public.faqs as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "manager_manage_catalog" on public.catalog_documents as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "staff_read_audit" on public.audit_events as PERMISSIVE for SELECT to public using(is_manager());
create policy "staff_read_own_notifications" on public.notifications as PERMISSIVE for SELECT to public using((recipient_id = auth.uid()));
create policy "staff_update_own_notifications" on public.notifications as PERMISSIVE for UPDATE to public using((recipient_id = auth.uid())) with check((recipient_id = auth.uid()));
create policy "staff_manage_storage_files" on public.storage_files as PERMISSIVE for ALL to public using(is_active_staff());
create policy "admin_manage_source_files" on public.source_files as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "admin_manage_candidates" on public.extraction_candidates as PERMISSIVE for ALL to public using(is_manager()) with check(is_manager());
create policy "admin_manage_import_runs" on public.import_runs as PERMISSIVE for ALL to public using(is_admin()) with check(is_admin());
create policy "rate_limit_policy" on public.rate_limit_entries as PERMISSIVE for ALL to public using(true) with check(true);
create policy "public_view_marketing_media" on storage.objects as PERMISSIVE for SELECT to public using((bucket_id = 'public-marketing'::text));
create policy "staff_manage_marketing_media" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'public-marketing'::text) AND is_active_staff())) with check(((bucket_id = 'public-marketing'::text) AND is_active_staff()));
create policy "staff_view_source_media" on storage.objects as PERMISSIVE for SELECT to public using(((bucket_id = 'private-source'::text) AND is_active_staff()));
create policy "admin_manage_source_media" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'private-source'::text) AND is_admin())) with check(((bucket_id = 'private-source'::text) AND is_admin()));
create policy "staff_view_documents" on storage.objects as PERMISSIVE for SELECT to public using(((bucket_id = 'private-documents'::text) AND is_active_staff()));
create policy "agent_manage_documents" on storage.objects as PERMISSIVE for ALL to public using(((bucket_id = 'private-documents'::text) AND is_agent())) with check(((bucket_id = 'private-documents'::text) AND is_agent()));
