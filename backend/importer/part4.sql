INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, district, city, side,
        record_type, mode, amount, currency, price_type, price_basis,
        availability, publication, description, source_note, cbi_eligible
      ) VALUES (
        'AVR-LEG-1019', 'sisli-2-1-ready-337', 'Legacy Listing — sisli-2-1-ready-337', 'Şişli', 'Istanbul', 'Europe',
        'unit_offer', 'sale', 337000, 'USD', 'fixed', 'advertised',
        'Unknown', 'Draft',
        'Historical listing from earlier catalogue snapshot; pending source verification.',
        'Not located in source Drive folder; preserved as legacy draft per instruction.',
        false
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, district, city, side,
        record_type, mode, amount, currency, price_type, price_basis,
        availability, publication, description, source_note, cbi_eligible
      ) VALUES (
        'AVR-LEG-1020', 'sisli-corner-2-1-655', 'Legacy Listing — sisli-corner-2-1-655', 'Şişli', 'Istanbul', 'Europe',
        'unit_offer', 'sale', 655000, 'USD', 'fixed', 'advertised',
        'Unknown', 'Draft',
        'Historical listing from earlier catalogue snapshot; pending source verification.',
        'Not located in source Drive folder; preserved as legacy draft per instruction.',
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, district, city, side,
        record_type, mode, amount, currency, price_type, price_basis,
        availability, publication, description, source_note, cbi_eligible
      ) VALUES (
        'AVR-LEG-1021', 'sisli-2-1-ready-432', 'Legacy Listing — sisli-2-1-ready-432', 'Şişli', 'Istanbul', 'Europe',
        'unit_offer', 'sale', 432000, 'USD', 'fixed', 'advertised',
        'Unknown', 'Draft',
        'Historical listing from earlier catalogue snapshot; pending source verification.',
        'Not located in source Drive folder; preserved as legacy draft per instruction.',
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, district, city, side,
        record_type, mode, amount, currency, price_type, price_basis,
        availability, publication, description, source_note, cbi_eligible
      ) VALUES (
        'AVR-LEG-1022', 'sisli-1-1-july-2027-500', 'Legacy Listing — sisli-1-1-july-2027-500', 'Şişli', 'Istanbul', 'Europe',
        'unit_offer', 'sale', 500000, 'USD', 'fixed', 'advertised',
        'Unknown', 'Draft',
        'Historical listing from earlier catalogue snapshot; pending source verification.',
        'Not located in source Drive folder; preserved as legacy draft per instruction.',
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'pre-investment-advisory',
        'Pre-Investment Advisory',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        1,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'legal-administrative-foundation',
        'Legal & Administrative Foundation',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        2,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'property-acquisition',
        'Property Acquisition',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        3,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'residence-citizenship-processing',
        'Residence & Citizenship Processing',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        4,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'post-acquisition-wealth-management',
        'Post-Acquisition & Wealth Management',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        5,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.services (slug, title, category, description, sort_order, is_published)
      VALUES (
        'long-term-family-security',
        'Long-Term Family Security',
        'Advisory',
        'Structured investment and client representation phase from official Avrasya documentation.',
        6,
        true
      )
      ON CONFLICT (slug) DO NOTHING;
    

    INSERT INTO public.catalog_documents (
      title, edition, storage_path, page_count, disclaimer, is_published
    ) VALUES (
      'Avrasya Properties Investment Portfolio & Advisory Guide',
      '2026 Comprehensive Edition',
      'sources/avrasya catalog_1_compressed.pdf',
      17,
      'Confidential investor advisory guide. All offers subject to title deed, zoning and valuation clearance.',
      true
    )
    ON CONFLICT DO NOTHING;