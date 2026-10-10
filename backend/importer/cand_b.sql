INSERT INTO public.extraction_candidates (
  source_file_id, candidate_type, raw_payload, normalized_payload,
  extraction_method, confidence, review_status, review_notes
) VALUES
(
    (SELECT id FROM public.source_files WHERE drive_id = '1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ' LIMIT 1),
    'file_provenance',
    '{"id":"1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ","folder":"Atasehir","filename":"IMG_20260920_103914.jpg","asset_path":"sources/Atasehir/IMG_20260920_103914.jpg","drive_url":"https://drive.google.com/file/d/1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ/view?usp=drivesdk","mime_type":"image/jpeg","bytes":275149,"sha256":"1ba1afa921f77b917fb9a3405bd798a08367df2cf5ffe923eed8824c58b38235"}'::jsonb,
    '{"filename":"IMG_20260920_103914.jpg","sha256":"1ba1afa921f77b917fb9a3405bd798a08367df2cf5ffe923eed8824c58b38235","folder":"Atasehir"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb' LIMIT 1),
    'file_provenance',
    '{"id":"1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb","folder":"Gunesli","filename":"VID-20260919-WA0061.mp4","asset_path":"sources/Gunesli/VID-20260919-WA0061.mp4","drive_url":"https://drive.google.com/file/d/1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb/view?usp=drivesdk","mime_type":"video/mp4","bytes":7285117,"sha256":"27c9a1dbf16e698e44ee33688b875176fa2ca0656dcc8c6a194d20ce3d821e7f"}'::jsonb,
    '{"filename":"VID-20260919-WA0061.mp4","sha256":"27c9a1dbf16e698e44ee33688b875176fa2ca0656dcc8c6a194d20ce3d821e7f","folder":"Gunesli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G' LIMIT 1),
    'file_provenance',
    '{"id":"1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G","folder":"Gunesli","filename":"IMG-20260919-WA0058.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0058.jpg","drive_url":"https://drive.google.com/file/d/1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G/view?usp=drivesdk","mime_type":"image/jpeg","bytes":283654,"sha256":"996e47015692fd8fc8d9a7c8a2cd0122cb6d883e5f8f1a0d21c27799d7c50f0e"}'::jsonb,
    '{"filename":"IMG-20260919-WA0058.jpg","sha256":"996e47015692fd8fc8d9a7c8a2cd0122cb6d883e5f8f1a0d21c27799d7c50f0e","folder":"Gunesli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn' LIMIT 1),
    'file_provenance',
    '{"id":"1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn","folder":"Gunesli","filename":"Scanned_20260920-1014.jpg","asset_path":"sources/Gunesli/Scanned_20260920-1014.jpg","drive_url":"https://drive.google.com/file/d/1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn/view?usp=drivesdk","mime_type":"image/jpeg","bytes":46346,"sha256":"877ae1c87522d9acac565943495cf8f8a0a33a1f88a18691c82343f65c93875a"}'::jsonb,
    '{"filename":"Scanned_20260920-1014.jpg","sha256":"877ae1c87522d9acac565943495cf8f8a0a33a1f88a18691c82343f65c93875a","folder":"Gunesli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7' LIMIT 1),
    'file_provenance',
    '{"id":"1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7","folder":"Gunesli","filename":"IMG-20260919-WA0060.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0060.jpg","drive_url":"https://drive.google.com/file/d/1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7/view?usp=drivesdk","mime_type":"image/jpeg","bytes":378552,"sha256":"8883db89666f5f359c618a1fd99e4704a23a4fe47d487bd561eaf65a545f5df5"}'::jsonb,
    '{"filename":"IMG-20260919-WA0060.jpg","sha256":"8883db89666f5f359c618a1fd99e4704a23a4fe47d487bd561eaf65a545f5df5","folder":"Gunesli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK' LIMIT 1),
    'file_provenance',
    '{"id":"1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK","folder":"Gunesli","filename":"IMG-20260919-WA0059.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0059.jpg","drive_url":"https://drive.google.com/file/d/1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK/view?usp=drivesdk","mime_type":"image/jpeg","bytes":360426,"sha256":"28360ee0b75d194d0ff51e40b5c80d96938a0e7259e2bebca2713c4f8892693b"}'::jsonb,
    '{"filename":"IMG-20260919-WA0059.jpg","sha256":"28360ee0b75d194d0ff51e40b5c80d96938a0e7259e2bebca2713c4f8892693b","folder":"Gunesli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf' LIMIT 1),
    'file_provenance',
    '{"id":"1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf","folder":"Orya","filename":"IMG_20260920_103223.jpg","asset_path":"sources/Orya/IMG_20260920_103223.jpg","drive_url":"https://drive.google.com/file/d/1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf/view?usp=drivesdk","mime_type":"image/jpeg","bytes":83944,"sha256":"77889bd263af85e63626facecbee68640a6b7da43a3f2b5cd83765a111296316"}'::jsonb,
    '{"filename":"IMG_20260920_103223.jpg","sha256":"77889bd263af85e63626facecbee68640a6b7da43a3f2b5cd83765a111296316","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao' LIMIT 1),
    'file_provenance',
    '{"id":"1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao","folder":"Orya","filename":"IMG-20260903-WA0056(1).jpg","asset_path":"sources/Orya/IMG-20260903-WA0056(1).jpg","drive_url":"https://drive.google.com/file/d/1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao/view?usp=drivesdk","mime_type":"image/jpeg","bytes":313377,"sha256":"4408395cf6338f8f8d29e0d46655309cb9de0da73c4870de27fb8ba02f94e5c6"}'::jsonb,
    '{"filename":"IMG-20260903-WA0056(1).jpg","sha256":"4408395cf6338f8f8d29e0d46655309cb9de0da73c4870de27fb8ba02f94e5c6","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi' LIMIT 1),
    'file_provenance',
    '{"id":"1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi","folder":"Orya","filename":"IMG_20260920_102915.jpg","asset_path":"sources/Orya/IMG_20260920_102915.jpg","drive_url":"https://drive.google.com/file/d/1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi/view?usp=drivesdk","mime_type":"image/jpeg","bytes":137899,"sha256":"f858ca4c97d7453dbb62fcb3e1655578dcde6bb396022112eb688d2c65f39b16"}'::jsonb,
    '{"filename":"IMG_20260920_102915.jpg","sha256":"f858ca4c97d7453dbb62fcb3e1655578dcde6bb396022112eb688d2c65f39b16","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM' LIMIT 1),
    'file_provenance',
    '{"id":"1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM","folder":"Orya","filename":"IMG_20260920_102743.jpg","asset_path":"sources/Orya/IMG_20260920_102743.jpg","drive_url":"https://drive.google.com/file/d/1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM/view?usp=drivesdk","mime_type":"image/jpeg","bytes":141670,"sha256":"3af32790a0397825981740b93e75728a273d1d032f9a5e7288aa087b1b3160df"}'::jsonb,
    '{"filename":"IMG_20260920_102743.jpg","sha256":"3af32790a0397825981740b93e75728a273d1d032f9a5e7288aa087b1b3160df","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1OO60sr7XWdqldnGULjR_XyWnfk-orgCo' LIMIT 1),
    'file_provenance',
    '{"id":"1OO60sr7XWdqldnGULjR_XyWnfk-orgCo","folder":"Orya","filename":"IMG-20260920-WA0012.jpg","asset_path":"sources/Orya/IMG-20260920-WA0012.jpg","drive_url":"https://drive.google.com/file/d/1OO60sr7XWdqldnGULjR_XyWnfk-orgCo/view?usp=drivesdk","mime_type":"image/jpeg","bytes":267488,"sha256":"94d6845650bd8917d2d0aac682f23f274691c5d1704a68a77360d921626e4823"}'::jsonb,
    '{"filename":"IMG-20260920-WA0012.jpg","sha256":"94d6845650bd8917d2d0aac682f23f274691c5d1704a68a77360d921626e4823","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '16yjkxBghSvQP7SXsPwCyGRM3jFT36olO' LIMIT 1),
    'file_provenance',
    '{"id":"16yjkxBghSvQP7SXsPwCyGRM3jFT36olO","folder":"Orya","filename":"IMG-20260920-WA0013.jpg","asset_path":"sources/Orya/IMG-20260920-WA0013.jpg","drive_url":"https://drive.google.com/file/d/16yjkxBghSvQP7SXsPwCyGRM3jFT36olO/view?usp=drivesdk","mime_type":"image/jpeg","bytes":243162,"sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214"}'::jsonb,
    '{"filename":"IMG-20260920-WA0013.jpg","sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214","folder":"Orya"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc' LIMIT 1),
    'file_provenance',
    '{"id":"1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc","folder":"Sisli","filename":"IMG-20260920-WA0010.jpg","asset_path":"sources/Sisli/IMG-20260920-WA0010.jpg","drive_url":"https://drive.google.com/file/d/1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc/view?usp=drivesdk","mime_type":"image/jpeg","bytes":221301,"sha256":"f7354d7837fd8df6f6dae365d20e879c29a18e111b3ed0933a1f6c47dda3efe6"}'::jsonb,
    '{"filename":"IMG-20260920-WA0010.jpg","sha256":"f7354d7837fd8df6f6dae365d20e879c29a18e111b3ed0933a1f6c47dda3efe6","folder":"Sisli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_' LIMIT 1),
    'file_provenance',
    '{"id":"1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_","folder":"Sisli","filename":"IMG-20260920-WA0011.jpg","asset_path":"sources/Sisli/IMG-20260920-WA0011.jpg","drive_url":"https://drive.google.com/file/d/1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_/view?usp=drivesdk","mime_type":"image/jpeg","bytes":220501,"sha256":"d52a793c24b6004ee397d09340cace582e1af4312ee096fa977af075bb099473"}'::jsonb,
    '{"filename":"IMG-20260920-WA0011.jpg","sha256":"d52a793c24b6004ee397d09340cace582e1af4312ee096fa977af075bb099473","folder":"Sisli"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  ),
(
    (SELECT id FROM public.source_files WHERE drive_id = '1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6' LIMIT 1),
    'file_provenance',
    '{"id":"1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6","folder":"Catalog","filename":"Avrasya_Properties_Investment_Catalog_Updated.pdf","asset_path":"sources/Catalog/Avrasya_Properties_Investment_Catalog_Updated.pdf","drive_url":"https://drive.google.com/file/d/1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6/view?usp=drivesdk","mime_type":"application/pdf","bytes":339786,"sha256":"dc03e6086ee92427fbbaa0954b35460bf59e87a248fdd576baee7c874ae02167"}'::jsonb,
    '{"filename":"Avrasya_Properties_Investment_Catalog_Updated.pdf","sha256":"dc03e6086ee92427fbbaa0954b35460bf59e87a248fdd576baee7c874ae02167","folder":"Catalog"}'::jsonb,
    'drive_manifest',
    1.00,
    'accepted',
    'Verified in 2026-10-10 baseline review'
  );