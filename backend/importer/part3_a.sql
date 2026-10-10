INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1001', 'besiktas-studio-package-500', 'Beşiktaş Furnished Studio Package', 'proposed editorial title unless project name explicitly supplied',
        'Beşiktaş', 'Istanbul', 'Europe', 'package', 'sale', 'Source: 2 duplex studio apartments; 4 studio units in total',
        NULL, NULL, NULL, 500000, 'USD',
        'fixed', 'package', 'Unknown', 'Draft',
        'Do not treat the package price as a per-studio price or infer separate legal units.', 'Delivery source: ' || COALESCE('31 December 2026', 'unspecified'), ARRAY['5% annual USD rental guarantee','Citizenship eligibility','15-minute walk to sea','Close to metro','15-minute walk to university'],
        true, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'besiktas-studio-package-500' LIMIT 1),
          'Cash Offer',
          500000,
          'USD',
          'package',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1002', 'rams-park-house-maslak-1-1xs', 'RAMS Park House Maslak — 1+1 XS', 'proposed editorial title unless project name explicitly supplied',
        'Maslak', 'Istanbul', 'Europe', 'unit_type', 'sale', '1+1 XS',
        50, NULL, NULL, 270000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        '', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), '{}'::text[],
        false, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'rams-park-house-maslak-1-1xs' LIMIT 1),
          'Cash Offer',
          270000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

          INSERT INTO public.pricing_options (
            offer_id, option_name, amount, currency, basis, is_default, down_payment_percent, installment_count
          ) VALUES (
            (SELECT id FROM public.marketing_offers WHERE slug = 'rams-park-house-maslak-1-1xs' LIMIT 1),
            'Installment Plan',
            295000,
            'USD',
            'installment_schedule',
            false,
            50,
            30
          );
        

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1003', 'sisli-ferikoy-duplex-182', 'Feriköy Entry Duplex', 'proposed editorial title unless project name explicitly supplied',
        'Şişli–Feriköy', 'Istanbul', 'Europe', 'unit_offer', 'sale', '1+1 Duplex',
        NULL, NULL, NULL, 182000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Not established as independently citizenship-qualifying.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['High ROI','Investment & Citizenship'],
        false, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'sisli-ferikoy-duplex-182' LIMIT 1),
          'Cash Offer',
          182000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1004', 'pearl-topkapi-2-1-410', 'Pearl Residence Topkapı — 2+1', 'proposed editorial title unless project name explicitly supplied',
        'Topkapı–Zeytinburnu', 'Istanbul', 'Europe', 'unit_offer', 'sale', '2+1',
        NULL, NULL, 127, 410000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'No live discount or offer-expiry date established.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['1% VAT','Exemption from title deed transfer tax','Airbnb and short-term rental approved','High rental income','Fatih 5 min','Taksim 15 min','Istinye University 5 min','Bakirkoy coast and Fisekhane 10 min','Istanbul Airport 35 min','Walking distance to E-5, Metrobus, tram and metro'],
        true, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'pearl-topkapi-2-1-410' LIMIT 1),
          'Cash Offer',
          410000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1005', 'gunesli-2-1-installment', 'Güneşli 2+1 — Installment Offer', 'proposed editorial title unless project name explicitly supplied',
        'Güneşli', 'Istanbul', 'Europe', 'unit_offer', 'sale', '2+1',
        NULL, NULL, 98.85, NULL, 'TRY',
        'on-request', 'installment_schedule', 'Unknown', 'Draft',
        'Do not convert to USD without a verified quote date and documented historical rate. Do not merge with a differently sized Gunesli offer.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['No title deed costs','Expert fee waived','1% VAT','Altinbas University 8 min','Erdem Hospital 3 min','Ataturk Olympic Stadium 15 min','TEM highway 12 min','Istanbul Airport 25 min','Mall of Istanbul 12 min','Metro 5 min'],
        false, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1006', 'sisli-ferikoy-duplex-490', 'Feriköy City-View Duplex', 'proposed editorial title unless project name explicitly supplied',
        'Şişli–Feriköy', 'Istanbul', 'Europe', 'unit_offer', 'sale', '2+1 Duplex',
        NULL, NULL, NULL, 490000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        '', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Open city view','High ROI','Citizenship eligible','Nisantasi 5 min','Osmanbey 5 min','Osmanbey Metro 10 min walk','Taksim 20 min walk'],
        true, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'sisli-ferikoy-duplex-490' LIMIT 1),
          'Cash Offer',
          490000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1007', 'gunesli-400-offer', 'Güneşli 1+1 / 2+1 — Offer Details on Request', 'proposed editorial title unless project name explicitly supplied',
        'Güneşli', 'Istanbul', 'Europe', 'ambiguous_offer', 'sale', '1+1 garden and 2+1 advertised together',
        NULL, NULL, 85, 400000, 'USD',
        'fixed', 'scope_unconfirmed', 'Unknown', 'Draft',
        'Same offer appears in two differently designed flyers. It is unclear whether $400,000 is a bundle price, alternative unit price, or another condition. One enquiry-led record; no exact-price budget matching until clarified.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Citizenship eligible','No title deed fees','Property valuation fee waived','1% VAT','Altinbas University 3 min','Ataturk Olympiad 5 min','Tema Istanbul 10 min','Istanbul Airport 40 min','Mall of Istanbul 5 min','Metro 2 min'],
        true, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'gunesli-400-offer' LIMIT 1),
          'Cash Offer',
          400000,
          'USD',
          'scope_unconfirmed',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1008', 'terrace-duplex-487-location-pending', '1+1 Duplex with Private Terrace', 'proposed editorial title unless project name explicitly supplied',
        'Location to confirm', 'Istanbul', 'unknown', 'unit_offer', 'sale', '1+1 Duplex',
        NULL, NULL, 183, 487000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Do not label the September promotion as current in October. Nearby landmarks do not establish exact district/address.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Osmanbey Metro 8 min walking','Taksim 20 min walking'],
        true, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

        INSERT INTO public.pricing_options (
          offer_id, option_name, amount, currency, basis, is_default, down_payment_amount, installment_count
        ) VALUES (
          (SELECT id FROM public.marketing_offers WHERE slug = 'terrace-duplex-487-location-pending' LIMIT 1),
          'Cash Offer',
          487000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1009', 'turkerler-ciftci-towers', 'Türkerler Çiftçi Towers — Beşiktaş', 'proposed editorial title unless project name explicitly supplied',
        'Beşiktaş', 'Istanbul', 'Europe', 'project', 'sale', NULL,
        NULL, NULL, NULL, NULL, NULL,
        'on-request', 'on_request', 'Unknown', 'Draft',
        'Project-level figures. Do not use 45 as an apartment floor or 40,000 m2 as unit area. No specific unit layouts/prices supplied.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), '{}'::text[],
        false, false
      )
      ON CONFLICT (slug) DO UPDATE SET
        marketing_title = EXCLUDED.marketing_title,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        updated_at = now();
    

      