alter table public.site_settings alter column license_no set default '';
update public.site_settings set license_no='' where license_no='İTO-34-78921';
