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
    

      