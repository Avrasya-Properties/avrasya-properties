BEGIN;

    INSERT INTO public.import_runs (id, run_type, total_sources, imported_sources, status, log_messages)
    VALUES (
      gen_random_uuid(),
      'full_import',
      30,
      30,
      'completed',
      '{"notes":"Drive baseline imported successfully"}'::jsonb
    );
  

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg', 'Others', 'IMG-20260919-WA0046.jpg', 'sources/Others/IMG-20260919-WA0046.jpg', 'https://drive.google.com/file/d/15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg/view?usp=drivesdk',
        'image/jpeg', 245840, '0d86f7f177923778a3f8362e70ee5d8898de3b48132dac86835472aec8f66b6c', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg' LIMIT 1),
        'file_provenance',
        '{"id":"15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg","folder":"Others","filename":"IMG-20260919-WA0046.jpg","asset_path":"sources/Others/IMG-20260919-WA0046.jpg","drive_url":"https://drive.google.com/file/d/15sT4aVhH-wjWtG_ojhUsig-WWtqcJGyg/view?usp=drivesdk","mime_type":"image/jpeg","bytes":245840,"sha256":"0d86f7f177923778a3f8362e70ee5d8898de3b48132dac86835472aec8f66b6c"}'::jsonb,
        '{"filename":"IMG-20260919-WA0046.jpg","sha256":"0d86f7f177923778a3f8362e70ee5d8898de3b48132dac86835472aec8f66b6c","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH', 'Others', 'IMG-20260919-WA0047.jpg', 'sources/Others/IMG-20260919-WA0047.jpg', 'https://drive.google.com/file/d/1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH/view?usp=drivesdk',
        'image/jpeg', 234849, '00cc8a9bac5286e2511f880d69c1b5340b790a6eb34e0b83a70dd8bb6e5bf6d7', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH' LIMIT 1),
        'file_provenance',
        '{"id":"1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH","folder":"Others","filename":"IMG-20260919-WA0047.jpg","asset_path":"sources/Others/IMG-20260919-WA0047.jpg","drive_url":"https://drive.google.com/file/d/1PgBe9AUmm5IwyM8GDyeGuDj8Bi-1o9GH/view?usp=drivesdk","mime_type":"image/jpeg","bytes":234849,"sha256":"00cc8a9bac5286e2511f880d69c1b5340b790a6eb34e0b83a70dd8bb6e5bf6d7"}'::jsonb,
        '{"filename":"IMG-20260919-WA0047.jpg","sha256":"00cc8a9bac5286e2511f880d69c1b5340b790a6eb34e0b83a70dd8bb6e5bf6d7","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs', 'Others', 'IMG-20260919-WA0044.jpg', 'sources/Others/IMG-20260919-WA0044.jpg', 'https://drive.google.com/file/d/1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs/view?usp=drivesdk',
        'image/jpeg', 207496, '3e81a74771ba1001d5ca9afee4aea3ac9f1208970a52b5c8130233fc65b802d7', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs' LIMIT 1),
        'file_provenance',
        '{"id":"1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs","folder":"Others","filename":"IMG-20260919-WA0044.jpg","asset_path":"sources/Others/IMG-20260919-WA0044.jpg","drive_url":"https://drive.google.com/file/d/1Pwr8oecAaIyJxeZvqC5ndJVnKebKMPcs/view?usp=drivesdk","mime_type":"image/jpeg","bytes":207496,"sha256":"3e81a74771ba1001d5ca9afee4aea3ac9f1208970a52b5c8130233fc65b802d7"}'::jsonb,
        '{"filename":"IMG-20260919-WA0044.jpg","sha256":"3e81a74771ba1001d5ca9afee4aea3ac9f1208970a52b5c8130233fc65b802d7","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5', 'Others', 'IMG-20260920-WA0004.jpg', 'sources/Others/IMG-20260920-WA0004.jpg', 'https://drive.google.com/file/d/1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5/view?usp=drivesdk',
        'image/jpeg', 299851, 'ed6335c351838db9e270a8fd93777e36617c11bc1a50ba8e5b89e036990c18dd', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5' LIMIT 1),
        'file_provenance',
        '{"id":"1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5","folder":"Others","filename":"IMG-20260920-WA0004.jpg","asset_path":"sources/Others/IMG-20260920-WA0004.jpg","drive_url":"https://drive.google.com/file/d/1f7crcms0n5tBTK0diOF8pvDNv6T7dUt5/view?usp=drivesdk","mime_type":"image/jpeg","bytes":299851,"sha256":"ed6335c351838db9e270a8fd93777e36617c11bc1a50ba8e5b89e036990c18dd"}'::jsonb,
        '{"filename":"IMG-20260920-WA0004.jpg","sha256":"ed6335c351838db9e270a8fd93777e36617c11bc1a50ba8e5b89e036990c18dd","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1eHM1CnKD068A-ohABmQVYDulkxp9xmGa', 'Others', 'IMG-20260920-WA0003.jpg', 'sources/Others/IMG-20260920-WA0003.jpg', 'https://drive.google.com/file/d/1eHM1CnKD068A-ohABmQVYDulkxp9xmGa/view?usp=drivesdk',
        'image/jpeg', 346197, '314a048b07be40192d9e3652ecf8e533a5c52a7c597ce7bea1b6efb816ff5460', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1eHM1CnKD068A-ohABmQVYDulkxp9xmGa' LIMIT 1),
        'file_provenance',
        '{"id":"1eHM1CnKD068A-ohABmQVYDulkxp9xmGa","folder":"Others","filename":"IMG-20260920-WA0003.jpg","asset_path":"sources/Others/IMG-20260920-WA0003.jpg","drive_url":"https://drive.google.com/file/d/1eHM1CnKD068A-ohABmQVYDulkxp9xmGa/view?usp=drivesdk","mime_type":"image/jpeg","bytes":346197,"sha256":"314a048b07be40192d9e3652ecf8e533a5c52a7c597ce7bea1b6efb816ff5460"}'::jsonb,
        '{"filename":"IMG-20260920-WA0003.jpg","sha256":"314a048b07be40192d9e3652ecf8e533a5c52a7c597ce7bea1b6efb816ff5460","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S', 'Others', 'IMG-20260920-WA0000.jpg', 'sources/Others/IMG-20260920-WA0000.jpg', 'https://drive.google.com/file/d/1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S/view?usp=drivesdk',
        'image/jpeg', 291990, '7ee9fb17d7f52e7b129feb2ebf182d67b28c109af98a2552a17ccfd03a11455e', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S' LIMIT 1),
        'file_provenance',
        '{"id":"1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S","folder":"Others","filename":"IMG-20260920-WA0000.jpg","asset_path":"sources/Others/IMG-20260920-WA0000.jpg","drive_url":"https://drive.google.com/file/d/1kYBzTHpNqTtN-qcQQkQhZ5No3vFhVD0S/view?usp=drivesdk","mime_type":"image/jpeg","bytes":291990,"sha256":"7ee9fb17d7f52e7b129feb2ebf182d67b28c109af98a2552a17ccfd03a11455e"}'::jsonb,
        '{"filename":"IMG-20260920-WA0000.jpg","sha256":"7ee9fb17d7f52e7b129feb2ebf182d67b28c109af98a2552a17ccfd03a11455e","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX', 'Others', 'IMG-20260920-WA0002.jpg', 'sources/Others/IMG-20260920-WA0002.jpg', 'https://drive.google.com/file/d/15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX/view?usp=drivesdk',
        'image/jpeg', 356453, '18fb4d17690a25ac74cfe9d84d6863ca4aea3f7d05234a2f44ea5f3dbe586fbe', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX' LIMIT 1),
        'file_provenance',
        '{"id":"15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX","folder":"Others","filename":"IMG-20260920-WA0002.jpg","asset_path":"sources/Others/IMG-20260920-WA0002.jpg","drive_url":"https://drive.google.com/file/d/15-2VUnvflnsV0oHeuqW_gTjMoZoY-PnX/view?usp=drivesdk","mime_type":"image/jpeg","bytes":356453,"sha256":"18fb4d17690a25ac74cfe9d84d6863ca4aea3f7d05234a2f44ea5f3dbe586fbe"}'::jsonb,
        '{"filename":"IMG-20260920-WA0002.jpg","sha256":"18fb4d17690a25ac74cfe9d84d6863ca4aea3f7d05234a2f44ea5f3dbe586fbe","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v', 'Others', 'IMG-20260919-WA0045.jpg', 'sources/Others/IMG-20260919-WA0045.jpg', 'https://drive.google.com/file/d/1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v/view?usp=drivesdk',
        'image/jpeg', 250330, '6d61b66ff38595d8ac6984b6f67af37498bdac1397d7782f1d3b8e3ff55b68c6', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v' LIMIT 1),
        'file_provenance',
        '{"id":"1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v","folder":"Others","filename":"IMG-20260919-WA0045.jpg","asset_path":"sources/Others/IMG-20260919-WA0045.jpg","drive_url":"https://drive.google.com/file/d/1L2Sempbh5Dpxs05zWOlNXXO7Q11P0H3v/view?usp=drivesdk","mime_type":"image/jpeg","bytes":250330,"sha256":"6d61b66ff38595d8ac6984b6f67af37498bdac1397d7782f1d3b8e3ff55b68c6"}'::jsonb,
        '{"filename":"IMG-20260919-WA0045.jpg","sha256":"6d61b66ff38595d8ac6984b6f67af37498bdac1397d7782f1d3b8e3ff55b68c6","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0', 'Others', 'IMG-20260920-WA0001.jpg', 'sources/Others/IMG-20260920-WA0001.jpg', 'https://drive.google.com/file/d/1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0/view?usp=drivesdk',
        'image/jpeg', 321686, 'f18699f19599731a0a7b8ce4824da2ed99aba7e0e9294b03eaf448eea5ecd8dc', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0' LIMIT 1),
        'file_provenance',
        '{"id":"1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0","folder":"Others","filename":"IMG-20260920-WA0001.jpg","asset_path":"sources/Others/IMG-20260920-WA0001.jpg","drive_url":"https://drive.google.com/file/d/1p-U-XgaWFlV4LY0Fd_B62VTxn8dlWhH0/view?usp=drivesdk","mime_type":"image/jpeg","bytes":321686,"sha256":"f18699f19599731a0a7b8ce4824da2ed99aba7e0e9294b03eaf448eea5ecd8dc"}'::jsonb,
        '{"filename":"IMG-20260920-WA0001.jpg","sha256":"f18699f19599731a0a7b8ce4824da2ed99aba7e0e9294b03eaf448eea5ecd8dc","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn', 'Others', 'IMG-20260919-WA0048.jpg', 'sources/Others/IMG-20260919-WA0048.jpg', 'https://drive.google.com/file/d/1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn/view?usp=drivesdk',
        'image/jpeg', 259874, 'b82d1958ca8dbb2691fbc53385d085aaaf5ac501cf4f8b6733937e2ca7d09c72', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn' LIMIT 1),
        'file_provenance',
        '{"id":"1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn","folder":"Others","filename":"IMG-20260919-WA0048.jpg","asset_path":"sources/Others/IMG-20260919-WA0048.jpg","drive_url":"https://drive.google.com/file/d/1tTzR8Jsw4VTic1NQ6l4nD-FgvrVq6_qn/view?usp=drivesdk","mime_type":"image/jpeg","bytes":259874,"sha256":"b82d1958ca8dbb2691fbc53385d085aaaf5ac501cf4f8b6733937e2ca7d09c72"}'::jsonb,
        '{"filename":"IMG-20260919-WA0048.jpg","sha256":"b82d1958ca8dbb2691fbc53385d085aaaf5ac501cf4f8b6733937e2ca7d09c72","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5', 'Others', 'IMG-20260919-WA0039.jpg', 'sources/Others/IMG-20260919-WA0039.jpg', 'https://drive.google.com/file/d/1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5/view?usp=drivesdk',
        'image/jpeg', 184609, 'dbf4f6ff46e631c9bdb9876101a2d4de5c9fa49ed9aa6880331ff2dffa421193', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5' LIMIT 1),
        'file_provenance',
        '{"id":"1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5","folder":"Others","filename":"IMG-20260919-WA0039.jpg","asset_path":"sources/Others/IMG-20260919-WA0039.jpg","drive_url":"https://drive.google.com/file/d/1nMCCsFYht0p7z0E8cl1pfq0Fyrum5Rl5/view?usp=drivesdk","mime_type":"image/jpeg","bytes":184609,"sha256":"dbf4f6ff46e631c9bdb9876101a2d4de5c9fa49ed9aa6880331ff2dffa421193"}'::jsonb,
        '{"filename":"IMG-20260919-WA0039.jpg","sha256":"dbf4f6ff46e631c9bdb9876101a2d4de5c9fa49ed9aa6880331ff2dffa421193","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS', 'Others', 'IMG-20260919-WA0043.jpg', 'sources/Others/IMG-20260919-WA0043.jpg', 'https://drive.google.com/file/d/16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS/view?usp=drivesdk',
        'image/jpeg', 179763, '4832fb43945019b6687f90b24036c473acb570cac7897a7e05f328bc32586e7d', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS' LIMIT 1),
        'file_provenance',
        '{"id":"16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS","folder":"Others","filename":"IMG-20260919-WA0043.jpg","asset_path":"sources/Others/IMG-20260919-WA0043.jpg","drive_url":"https://drive.google.com/file/d/16f3WWtbiAHLg0NGeDMQEO582_8_VsPkS/view?usp=drivesdk","mime_type":"image/jpeg","bytes":179763,"sha256":"4832fb43945019b6687f90b24036c473acb570cac7897a7e05f328bc32586e7d"}'::jsonb,
        '{"filename":"IMG-20260919-WA0043.jpg","sha256":"4832fb43945019b6687f90b24036c473acb570cac7897a7e05f328bc32586e7d","folder":"Others"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg', 'Umraniye', 'IMG-20260920-WA0013.jpg', 'sources/Umraniye/IMG-20260920-WA0013.jpg', 'https://drive.google.com/file/d/1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg/view?usp=drivesdk',
        'image/jpeg', 243162, 'b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg' LIMIT 1),
        'file_provenance',
        '{"id":"1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg","folder":"Umraniye","filename":"IMG-20260920-WA0013.jpg","asset_path":"sources/Umraniye/IMG-20260920-WA0013.jpg","drive_url":"https://drive.google.com/file/d/1OoDj6OVodRx1Yr5et7Kpwr0qXF7VUoxg/view?usp=drivesdk","mime_type":"image/jpeg","bytes":243162,"sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214"}'::jsonb,
        '{"filename":"IMG-20260920-WA0013.jpg","sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214","folder":"Umraniye"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8', 'Atasehir', 'IMG_20260920_103811.jpg', 'sources/Atasehir/IMG_20260920_103811.jpg', 'https://drive.google.com/file/d/1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8/view?usp=drivesdk',
        'image/jpeg', 828473, '1e8e0defedc41fb8d1d4df847567b77a355ac70afbfbabb4783324bb0bfbfa2d', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8' LIMIT 1),
        'file_provenance',
        '{"id":"1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8","folder":"Atasehir","filename":"IMG_20260920_103811.jpg","asset_path":"sources/Atasehir/IMG_20260920_103811.jpg","drive_url":"https://drive.google.com/file/d/1PFRXtHXED-V-z_L-tWiEn5D8ANQVhgH8/view?usp=drivesdk","mime_type":"image/jpeg","bytes":828473,"sha256":"1e8e0defedc41fb8d1d4df847567b77a355ac70afbfbabb4783324bb0bfbfa2d"}'::jsonb,
        '{"filename":"IMG_20260920_103811.jpg","sha256":"1e8e0defedc41fb8d1d4df847567b77a355ac70afbfbabb4783324bb0bfbfa2d","folder":"Atasehir"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq', 'Atasehir', 'IMG_20260920_103826.jpg', 'sources/Atasehir/IMG_20260920_103826.jpg', 'https://drive.google.com/file/d/1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq/view?usp=drivesdk',
        'image/jpeg', 1061747, '4e520a143bb6f7f028f126619ce90387b24b9dc5c7174e835bc998baf66b0217', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq' LIMIT 1),
        'file_provenance',
        '{"id":"1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq","folder":"Atasehir","filename":"IMG_20260920_103826.jpg","asset_path":"sources/Atasehir/IMG_20260920_103826.jpg","drive_url":"https://drive.google.com/file/d/1mHk4aqBP_n_N47BHEl5r_Sr4C2FECKHq/view?usp=drivesdk","mime_type":"image/jpeg","bytes":1061747,"sha256":"4e520a143bb6f7f028f126619ce90387b24b9dc5c7174e835bc998baf66b0217"}'::jsonb,
        '{"filename":"IMG_20260920_103826.jpg","sha256":"4e520a143bb6f7f028f126619ce90387b24b9dc5c7174e835bc998baf66b0217","folder":"Atasehir"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ', 'Atasehir', 'IMG_20260920_103914.jpg', 'sources/Atasehir/IMG_20260920_103914.jpg', 'https://drive.google.com/file/d/1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ/view?usp=drivesdk',
        'image/jpeg', 275149, '1ba1afa921f77b917fb9a3405bd798a08367df2cf5ffe923eed8824c58b38235', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ' LIMIT 1),
        'file_provenance',
        '{"id":"1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ","folder":"Atasehir","filename":"IMG_20260920_103914.jpg","asset_path":"sources/Atasehir/IMG_20260920_103914.jpg","drive_url":"https://drive.google.com/file/d/1Mv--JnZBe6mwHhjeL68CVe77pOWAL3CJ/view?usp=drivesdk","mime_type":"image/jpeg","bytes":275149,"sha256":"1ba1afa921f77b917fb9a3405bd798a08367df2cf5ffe923eed8824c58b38235"}'::jsonb,
        '{"filename":"IMG_20260920_103914.jpg","sha256":"1ba1afa921f77b917fb9a3405bd798a08367df2cf5ffe923eed8824c58b38235","folder":"Atasehir"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb', 'Gunesli', 'VID-20260919-WA0061.mp4', 'sources/Gunesli/VID-20260919-WA0061.mp4', 'https://drive.google.com/file/d/1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb/view?usp=drivesdk',
        'video/mp4', 7285117, '27c9a1dbf16e698e44ee33688b875176fa2ca0656dcc8c6a194d20ce3d821e7f', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb' LIMIT 1),
        'file_provenance',
        '{"id":"1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb","folder":"Gunesli","filename":"VID-20260919-WA0061.mp4","asset_path":"sources/Gunesli/VID-20260919-WA0061.mp4","drive_url":"https://drive.google.com/file/d/1EnrNhiX5LqaPlqhgvkU60YdMljiIEudb/view?usp=drivesdk","mime_type":"video/mp4","bytes":7285117,"sha256":"27c9a1dbf16e698e44ee33688b875176fa2ca0656dcc8c6a194d20ce3d821e7f"}'::jsonb,
        '{"filename":"VID-20260919-WA0061.mp4","sha256":"27c9a1dbf16e698e44ee33688b875176fa2ca0656dcc8c6a194d20ce3d821e7f","folder":"Gunesli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G', 'Gunesli', 'IMG-20260919-WA0058.jpg', 'sources/Gunesli/IMG-20260919-WA0058.jpg', 'https://drive.google.com/file/d/1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G/view?usp=drivesdk',
        'image/jpeg', 283654, '996e47015692fd8fc8d9a7c8a2cd0122cb6d883e5f8f1a0d21c27799d7c50f0e', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G' LIMIT 1),
        'file_provenance',
        '{"id":"1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G","folder":"Gunesli","filename":"IMG-20260919-WA0058.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0058.jpg","drive_url":"https://drive.google.com/file/d/1LwJ5TbfuZ6t9A6818eDKGbuyCs3SjK2G/view?usp=drivesdk","mime_type":"image/jpeg","bytes":283654,"sha256":"996e47015692fd8fc8d9a7c8a2cd0122cb6d883e5f8f1a0d21c27799d7c50f0e"}'::jsonb,
        '{"filename":"IMG-20260919-WA0058.jpg","sha256":"996e47015692fd8fc8d9a7c8a2cd0122cb6d883e5f8f1a0d21c27799d7c50f0e","folder":"Gunesli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn', 'Gunesli', 'Scanned_20260920-1014.jpg', 'sources/Gunesli/Scanned_20260920-1014.jpg', 'https://drive.google.com/file/d/1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn/view?usp=drivesdk',
        'image/jpeg', 46346, '877ae1c87522d9acac565943495cf8f8a0a33a1f88a18691c82343f65c93875a', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn' LIMIT 1),
        'file_provenance',
        '{"id":"1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn","folder":"Gunesli","filename":"Scanned_20260920-1014.jpg","asset_path":"sources/Gunesli/Scanned_20260920-1014.jpg","drive_url":"https://drive.google.com/file/d/1Thn5zFLowvQAKpsZkt0s2mG8_knyOaLn/view?usp=drivesdk","mime_type":"image/jpeg","bytes":46346,"sha256":"877ae1c87522d9acac565943495cf8f8a0a33a1f88a18691c82343f65c93875a"}'::jsonb,
        '{"filename":"Scanned_20260920-1014.jpg","sha256":"877ae1c87522d9acac565943495cf8f8a0a33a1f88a18691c82343f65c93875a","folder":"Gunesli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7', 'Gunesli', 'IMG-20260919-WA0060.jpg', 'sources/Gunesli/IMG-20260919-WA0060.jpg', 'https://drive.google.com/file/d/1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7/view?usp=drivesdk',
        'image/jpeg', 378552, '8883db89666f5f359c618a1fd99e4704a23a4fe47d487bd561eaf65a545f5df5', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7' LIMIT 1),
        'file_provenance',
        '{"id":"1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7","folder":"Gunesli","filename":"IMG-20260919-WA0060.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0060.jpg","drive_url":"https://drive.google.com/file/d/1ohOI4dvHW2m_Clnaza2DzuHUzpkXkHQ7/view?usp=drivesdk","mime_type":"image/jpeg","bytes":378552,"sha256":"8883db89666f5f359c618a1fd99e4704a23a4fe47d487bd561eaf65a545f5df5"}'::jsonb,
        '{"filename":"IMG-20260919-WA0060.jpg","sha256":"8883db89666f5f359c618a1fd99e4704a23a4fe47d487bd561eaf65a545f5df5","folder":"Gunesli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK', 'Gunesli', 'IMG-20260919-WA0059.jpg', 'sources/Gunesli/IMG-20260919-WA0059.jpg', 'https://drive.google.com/file/d/1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK/view?usp=drivesdk',
        'image/jpeg', 360426, '28360ee0b75d194d0ff51e40b5c80d96938a0e7259e2bebca2713c4f8892693b', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK' LIMIT 1),
        'file_provenance',
        '{"id":"1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK","folder":"Gunesli","filename":"IMG-20260919-WA0059.jpg","asset_path":"sources/Gunesli/IMG-20260919-WA0059.jpg","drive_url":"https://drive.google.com/file/d/1WAau8qqACO1yWbk9uPAffAzB_lhbAPUK/view?usp=drivesdk","mime_type":"image/jpeg","bytes":360426,"sha256":"28360ee0b75d194d0ff51e40b5c80d96938a0e7259e2bebca2713c4f8892693b"}'::jsonb,
        '{"filename":"IMG-20260919-WA0059.jpg","sha256":"28360ee0b75d194d0ff51e40b5c80d96938a0e7259e2bebca2713c4f8892693b","folder":"Gunesli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf', 'Orya', 'IMG_20260920_103223.jpg', 'sources/Orya/IMG_20260920_103223.jpg', 'https://drive.google.com/file/d/1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf/view?usp=drivesdk',
        'image/jpeg', 83944, '77889bd263af85e63626facecbee68640a6b7da43a3f2b5cd83765a111296316', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf' LIMIT 1),
        'file_provenance',
        '{"id":"1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf","folder":"Orya","filename":"IMG_20260920_103223.jpg","asset_path":"sources/Orya/IMG_20260920_103223.jpg","drive_url":"https://drive.google.com/file/d/1bjtgyqkScE5npFFVfJgq-SpVQ3WH9Irf/view?usp=drivesdk","mime_type":"image/jpeg","bytes":83944,"sha256":"77889bd263af85e63626facecbee68640a6b7da43a3f2b5cd83765a111296316"}'::jsonb,
        '{"filename":"IMG_20260920_103223.jpg","sha256":"77889bd263af85e63626facecbee68640a6b7da43a3f2b5cd83765a111296316","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao', 'Orya', 'IMG-20260903-WA0056(1).jpg', 'sources/Orya/IMG-20260903-WA0056(1).jpg', 'https://drive.google.com/file/d/1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao/view?usp=drivesdk',
        'image/jpeg', 313377, '4408395cf6338f8f8d29e0d46655309cb9de0da73c4870de27fb8ba02f94e5c6', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao' LIMIT 1),
        'file_provenance',
        '{"id":"1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao","folder":"Orya","filename":"IMG-20260903-WA0056(1).jpg","asset_path":"sources/Orya/IMG-20260903-WA0056(1).jpg","drive_url":"https://drive.google.com/file/d/1O0nFmQk9A4rj3-Jgblwb1C3A_negl2Ao/view?usp=drivesdk","mime_type":"image/jpeg","bytes":313377,"sha256":"4408395cf6338f8f8d29e0d46655309cb9de0da73c4870de27fb8ba02f94e5c6"}'::jsonb,
        '{"filename":"IMG-20260903-WA0056(1).jpg","sha256":"4408395cf6338f8f8d29e0d46655309cb9de0da73c4870de27fb8ba02f94e5c6","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi', 'Orya', 'IMG_20260920_102915.jpg', 'sources/Orya/IMG_20260920_102915.jpg', 'https://drive.google.com/file/d/1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi/view?usp=drivesdk',
        'image/jpeg', 137899, 'f858ca4c97d7453dbb62fcb3e1655578dcde6bb396022112eb688d2c65f39b16', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi' LIMIT 1),
        'file_provenance',
        '{"id":"1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi","folder":"Orya","filename":"IMG_20260920_102915.jpg","asset_path":"sources/Orya/IMG_20260920_102915.jpg","drive_url":"https://drive.google.com/file/d/1UqKK8LlQ3zW3GT0hMDFv4c2Z1PTksGMi/view?usp=drivesdk","mime_type":"image/jpeg","bytes":137899,"sha256":"f858ca4c97d7453dbb62fcb3e1655578dcde6bb396022112eb688d2c65f39b16"}'::jsonb,
        '{"filename":"IMG_20260920_102915.jpg","sha256":"f858ca4c97d7453dbb62fcb3e1655578dcde6bb396022112eb688d2c65f39b16","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM', 'Orya', 'IMG_20260920_102743.jpg', 'sources/Orya/IMG_20260920_102743.jpg', 'https://drive.google.com/file/d/1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM/view?usp=drivesdk',
        'image/jpeg', 141670, '3af32790a0397825981740b93e75728a273d1d032f9a5e7288aa087b1b3160df', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM' LIMIT 1),
        'file_provenance',
        '{"id":"1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM","folder":"Orya","filename":"IMG_20260920_102743.jpg","asset_path":"sources/Orya/IMG_20260920_102743.jpg","drive_url":"https://drive.google.com/file/d/1-C-UT26lzMbVxPN-Ngx7hcm2Bm2WQVDM/view?usp=drivesdk","mime_type":"image/jpeg","bytes":141670,"sha256":"3af32790a0397825981740b93e75728a273d1d032f9a5e7288aa087b1b3160df"}'::jsonb,
        '{"filename":"IMG_20260920_102743.jpg","sha256":"3af32790a0397825981740b93e75728a273d1d032f9a5e7288aa087b1b3160df","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1OO60sr7XWdqldnGULjR_XyWnfk-orgCo', 'Orya', 'IMG-20260920-WA0012.jpg', 'sources/Orya/IMG-20260920-WA0012.jpg', 'https://drive.google.com/file/d/1OO60sr7XWdqldnGULjR_XyWnfk-orgCo/view?usp=drivesdk',
        'image/jpeg', 267488, '94d6845650bd8917d2d0aac682f23f274691c5d1704a68a77360d921626e4823', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1OO60sr7XWdqldnGULjR_XyWnfk-orgCo' LIMIT 1),
        'file_provenance',
        '{"id":"1OO60sr7XWdqldnGULjR_XyWnfk-orgCo","folder":"Orya","filename":"IMG-20260920-WA0012.jpg","asset_path":"sources/Orya/IMG-20260920-WA0012.jpg","drive_url":"https://drive.google.com/file/d/1OO60sr7XWdqldnGULjR_XyWnfk-orgCo/view?usp=drivesdk","mime_type":"image/jpeg","bytes":267488,"sha256":"94d6845650bd8917d2d0aac682f23f274691c5d1704a68a77360d921626e4823"}'::jsonb,
        '{"filename":"IMG-20260920-WA0012.jpg","sha256":"94d6845650bd8917d2d0aac682f23f274691c5d1704a68a77360d921626e4823","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '16yjkxBghSvQP7SXsPwCyGRM3jFT36olO', 'Orya', 'IMG-20260920-WA0013.jpg', 'sources/Orya/IMG-20260920-WA0013.jpg', 'https://drive.google.com/file/d/16yjkxBghSvQP7SXsPwCyGRM3jFT36olO/view?usp=drivesdk',
        'image/jpeg', 243162, 'b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '16yjkxBghSvQP7SXsPwCyGRM3jFT36olO' LIMIT 1),
        'file_provenance',
        '{"id":"16yjkxBghSvQP7SXsPwCyGRM3jFT36olO","folder":"Orya","filename":"IMG-20260920-WA0013.jpg","asset_path":"sources/Orya/IMG-20260920-WA0013.jpg","drive_url":"https://drive.google.com/file/d/16yjkxBghSvQP7SXsPwCyGRM3jFT36olO/view?usp=drivesdk","mime_type":"image/jpeg","bytes":243162,"sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214"}'::jsonb,
        '{"filename":"IMG-20260920-WA0013.jpg","sha256":"b53b456df259234ddf10b1570ac0d9c62947b7361bd5fd4edf1c3f20b891e214","folder":"Orya"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc', 'Sisli', 'IMG-20260920-WA0010.jpg', 'sources/Sisli/IMG-20260920-WA0010.jpg', 'https://drive.google.com/file/d/1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc/view?usp=drivesdk',
        'image/jpeg', 221301, 'f7354d7837fd8df6f6dae365d20e879c29a18e111b3ed0933a1f6c47dda3efe6', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc' LIMIT 1),
        'file_provenance',
        '{"id":"1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc","folder":"Sisli","filename":"IMG-20260920-WA0010.jpg","asset_path":"sources/Sisli/IMG-20260920-WA0010.jpg","drive_url":"https://drive.google.com/file/d/1ryaPLeqKEYWGBD-amStBEkVsDdwx4KYc/view?usp=drivesdk","mime_type":"image/jpeg","bytes":221301,"sha256":"f7354d7837fd8df6f6dae365d20e879c29a18e111b3ed0933a1f6c47dda3efe6"}'::jsonb,
        '{"filename":"IMG-20260920-WA0010.jpg","sha256":"f7354d7837fd8df6f6dae365d20e879c29a18e111b3ed0933a1f6c47dda3efe6","folder":"Sisli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_', 'Sisli', 'IMG-20260920-WA0011.jpg', 'sources/Sisli/IMG-20260920-WA0011.jpg', 'https://drive.google.com/file/d/1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_/view?usp=drivesdk',
        'image/jpeg', 220501, 'd52a793c24b6004ee397d09340cace582e1af4312ee096fa977af075bb099473', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_' LIMIT 1),
        'file_provenance',
        '{"id":"1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_","folder":"Sisli","filename":"IMG-20260920-WA0011.jpg","asset_path":"sources/Sisli/IMG-20260920-WA0011.jpg","drive_url":"https://drive.google.com/file/d/1NIQ-gl4CN6ZR1GY1Wsc8xX4wXeg-Ov3_/view?usp=drivesdk","mime_type":"image/jpeg","bytes":220501,"sha256":"d52a793c24b6004ee397d09340cace582e1af4312ee096fa977af075bb099473"}'::jsonb,
        '{"filename":"IMG-20260920-WA0011.jpg","sha256":"d52a793c24b6004ee397d09340cace582e1af4312ee096fa977af075bb099473","folder":"Sisli"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.source_files (
        drive_id, folder_name, filename, asset_path, drive_url,
        mime_type, bytes, sha256, import_status
      ) VALUES (
        '1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6', 'Catalog', 'Avrasya_Properties_Investment_Catalog_Updated.pdf', 'sources/Catalog/Avrasya_Properties_Investment_Catalog_Updated.pdf', 'https://drive.google.com/file/d/1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6/view?usp=drivesdk',
        'application/pdf', 339786, 'dc03e6086ee92427fbbaa0954b35460bf59e87a248fdd576baee7c874ae02167', 'imported'
      )
      ON CONFLICT (drive_id) DO UPDATE SET
        sha256 = EXCLUDED.sha256,
        bytes = EXCLUDED.bytes,
        updated_at = now();
    

      INSERT INTO public.extraction_candidates (
        source_file_id, candidate_type, raw_payload, normalized_payload,
        extraction_method, confidence, review_status, review_notes
      ) VALUES (
        (SELECT id FROM public.source_files WHERE drive_id = '1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6' LIMIT 1),
        'file_provenance',
        '{"id":"1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6","folder":"Catalog","filename":"Avrasya_Properties_Investment_Catalog_Updated.pdf","asset_path":"sources/Catalog/Avrasya_Properties_Investment_Catalog_Updated.pdf","drive_url":"https://drive.google.com/file/d/1QrixxeOCRs8MFmmoOMRHVsmwIcYDt0N6/view?usp=drivesdk","mime_type":"application/pdf","bytes":339786,"sha256":"dc03e6086ee92427fbbaa0954b35460bf59e87a248fdd576baee7c874ae02167"}'::jsonb,
        '{"filename":"Avrasya_Properties_Investment_Catalog_Updated.pdf","sha256":"dc03e6086ee92427fbbaa0954b35460bf59e87a248fdd576baee7c874ae02167","folder":"Catalog"}'::jsonb,
        'drive_manifest',
        1.00,
        'accepted',
        'Verified in 2026-10-10 baseline review'
      );
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'RAMS Park House Maslak',
        'rams-park-house-maslak',
        'Maslak',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Oryapark Istanbul',
        'oryapark-istanbul',
        'Ümraniye',
        'Istanbul',
        'Asia',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Güneşli Residences',
        'gunesli-residences',
        'Güneşli',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Beşiktaş Suites',
        'besiktas-suites',
        'Beşiktaş',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Topkapı Residences',
        'topkapi-residences',
        'Topkapı',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Şişli Central',
        'sisli-central',
        'Şişli',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

      INSERT INTO public.projects (name, slug, district, city, side, description)
      VALUES (
        'Türkerler Çiftçi Towers',
        'turkerler-ciftci-towers-proj',
        'Beşiktaş',
        'Istanbul',
        'Europe',
        'Imported from verified source baseline'
      )
      ON CONFLICT (slug) DO NOTHING;
    

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
    

      INSERT INTO public.marketing_offers (
        ref, slug, marketing_title, title_provenance,
        district, city, side, record_type, mode, layout_label,
        gross_m2, net_m2, area_m2, amount, currency,
        price_type, price_basis, availability, publication,
        description, source_note, claims_requiring_confirmation,
        cbi_eligible, cbi_verified
      ) VALUES (
        'AVR-1010', 'atakoy-sea-view-999', 'Ataköy Sea-View Residence', 'proposed editorial title unless project name explicitly supplied',
        'Ataköy', 'Istanbul', 'Europe', 'unit_offer', 'sale', NULL,
        NULL, NULL, 126.98, 999000, 'USD',
        'fixed', 'special_offer', 'Unknown', 'Draft',
        'Do not publish live scarcity claim or guess the layout/project name.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Direct sea view','Private shoreline','Last one'],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'atakoy-sea-view-999' LIMIT 1),
          'Cash Offer',
          999000,
          'USD',
          'special_offer',
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
        'AVR-1011', 'sisli-duplex-460', 'Şişli 2+1 Duplex', 'proposed editorial title unless project name explicitly supplied',
        'Şişli', 'Istanbul', 'Europe', 'unit_offer', 'sale', '2+1 Duplex',
        NULL, NULL, NULL, 460000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Keep distinct from $490,000 Ferikoy duplex; identity is not established as the same unit.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Citizenship eligible','High ROI','Osmanbey Metro 10 min walk','Taksim 20 min walk'],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'sisli-duplex-460' LIMIT 1),
          'Cash Offer',
          460000,
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
        'AVR-1012', 'topkapi-two-apartment-package-480', 'Topkapı Two-Apartment Package', 'proposed editorial title unless project name explicitly supplied',
        'Topkapı', 'Istanbul', 'Europe', 'package', 'sale', 'Two apartments; layouts not supplied',
        66, NULL, NULL, 480000, 'USD',
        'fixed', 'package', 'Unknown', 'Draft',
        'Package price, not per apartment. Two × 66 m2 gross; do not invent room layouts or merge with the separate 127 m2 Pearl offer.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Citizenship package','Airbnb','High rental income','Metro walking distance','On E5'],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'topkapi-two-apartment-package-480' LIMIT 1),
          'Cash Offer',
          480000,
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
        'AVR-1013', 'atasehir-173-1-1-420', 'Ataşehir 173 — 1+1 Residence', 'proposed editorial title unless project name explicitly supplied',
        'Ataşehir', 'Istanbul', 'Asia', 'unit_type', 'sale', '1+1',
        NULL, NULL, NULL, 420000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Only the 1+1 has a supplied price. Do not apply $420,000 to 2+1/3+1.', 'Delivery source: ' || COALESCE('18 months; anchor date not established', 'unspecified'), ARRAY['Emlak Konut assurance / government guarantee wording','Ready title deed','No extra fees','No expertise report needed','Citizenship suitability','5 min to Atasehir Finance Center','Near hospitals, schools, malls and transportation'],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'atasehir-173-1-1-420' LIMIT 1),
          'Cash Offer',
          420000,
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
        'AVR-1014', 'oryapark-1-1-325', 'Avrupa Residence Oryapark — 1+1', 'proposed editorial title unless project name explicitly supplied',
        'Ümraniye', 'Istanbul', 'Asia', 'unit_type', 'sale', '1+1',
        NULL, NULL, 79, 325000, 'USD',
        'fixed', 'advertised', 'Unknown', 'Draft',
        '79 m2 is not explicitly labelled gross in this flyer. Do not inherit the 2+1 area basis or explicit delivery date automatically.', 'Delivery source: ' || COALESCE('3 months later; anchor date not established', 'unspecified'), '{}'::text[],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'oryapark-1-1-325' LIMIT 1),
          'Cash Offer',
          325000,
          'USD',
          'advertised',
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
        'AVR-1015', 'oryapark-2-1-quote', 'Avrupa Residence Oryapark — 2+1', 'proposed editorial title unless project name explicitly supplied',
        'Ümraniye', 'Istanbul', 'Asia', 'unit_type', 'sale', '2+1',
        136, NULL, NULL, NULL, 'USD',
        'on-request', 'conflicting_starting_prices', 'Unknown', 'Draft',
        'One grouped 2+1 record pending clarification. Do not imply the $475,000 variant has 136 m2 or the same kitchen. Identical $515,000 flyer exists in two folders and must not create two listings.', 'Delivery source: ' || COALESCE('30 November 2026 in text note; other flyers say 3 months later', 'unspecified'), ARRAY['Valuation report ready','Citizenship suitability','High rental income','Amazing view','Full facilities','Close to metro/shopping mall/Financial Center'],
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
        'AVR-1016', 'sisli-1-1-july-2027-488', 'Avrupa Konutları Şişli — Ground-Floor 1+1', 'proposed editorial title unless project name explicitly supplied',
        'Şişli', 'Istanbul', 'Europe', 'unit_offer', 'sale', '1+1',
        81.27, NULL, NULL, 488000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Legacy slug retained for route compatibility only. Despite its slug, this Drive flyer supplies no July 2027 delivery date. Do not show a live discount without confirmation.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), ARRAY['Citizenship suitability','No appraisal required'],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'sisli-1-1-july-2027-488' LIMIT 1),
          'Cash Offer',
          488000,
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
        'AVR-1017', 'sisli-block5-floor2-unit21-497', 'Avrupa Konutları Şişli — 1+1, Unit 21', 'proposed editorial title unless project name explicitly supplied',
        'Şişli', 'Istanbul', 'Europe', 'unit_offer', 'sale', '1+1',
        NULL, NULL, 81.27, 497000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Separate unit from ground-floor $488,000 offer. Area shown as 81.27 m2 without explicit gross/net label. Do not inherit ground-floor metadata. Flyer includes Is GYO branding.', 'Delivery source: ' || COALESCE('August 2027', 'unspecified'), '{}'::text[],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'sisli-block5-floor2-unit21-497' LIMIT 1),
          'Cash Offer',
          497000,
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
        'AVR-1018', 'avrupa-gunesli-b10-f2-u40', 'Avrupa Konutları Güneşli — Block 10, Unit 40', 'proposed editorial title unless project name explicitly supplied',
        'Güneşli', 'Istanbul', 'Europe', 'unit_offer', 'sale', '2+1',
        NULL, NULL, NULL, 418000, 'USD',
        'fixed', 'cash', 'Unknown', 'Draft',
        'Family-plan ranges, not exact areas for unit 40. $439,000 is arithmetic cash price + stated expenses, not a verified all-inclusive transaction total. Source video shows door 06 and is not verified as unit 40.', 'Delivery source: ' || COALESCE(NULL, 'unspecified'), '{}'::text[],
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
          (SELECT id FROM public.marketing_offers WHERE slug = 'avrupa-gunesli-b10-f2-u40' LIMIT 1),
          'Cash Offer',
          418000,
          'USD',
          'cash',
          true,
          NULL,
          NULL
        );
      

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
  
COMMIT;