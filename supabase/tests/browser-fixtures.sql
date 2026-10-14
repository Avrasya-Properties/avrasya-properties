-- Fictional fixtures in disposable CI PostgreSQL only.
insert into auth.users(id) select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,5) i;
insert into auth.sessions(id,user_id) select ('00000000-0000-4000-8000-'||lpad((100+i)::text,12,'0'))::uuid,('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,5) i;
insert into staff_profiles(id,email,name,role,is_active) values
('00000000-0000-4000-8000-000000000001','admin@example.test','Test Administrator','admin',true),
('00000000-0000-4000-8000-000000000002','manager@example.test','Test Manager','manager',true),
('00000000-0000-4000-8000-000000000003','agent@example.test','Test Agent','agent',true),
('00000000-0000-4000-8000-000000000004','other@example.test','Other Agent','agent',true),
('00000000-0000-4000-8000-000000000005','viewer@example.test','Test Viewer','viewer',true);
insert into site_settings(singleton_key) values('default') on conflict(singleton_key) do nothing;
insert into projects(id,name,slug,district) values('00000000-0000-4000-8000-000000006001','Test development','test-development','Test district');
insert into physical_units(id,project_id,unit_number,status) values('00000000-0000-4000-8000-000000002001','00000000-0000-4000-8000-000000006001','A-21','Available');
insert into contacts(id,name,email,assigned_agent_id) values('00000000-0000-4000-8000-000000001001','Other private buyer','other-buyer@example.test','00000000-0000-4000-8000-000000000004');
insert into services(slug,title,description,is_published) values('advisory','Managed service','Initial service description',true);
