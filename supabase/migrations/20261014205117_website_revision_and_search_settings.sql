-- Public notifications contain a revision only, never drafts or customer information.
alter table public.site_settings
  add column if not exists districts jsonb not null default '[]'::jsonb,
  add column if not exists layouts jsonb not null default '[]'::jsonb,
  add column if not exists budget_ranges jsonb not null default '[]'::jsonb;
alter table public.site_settings add constraint site_search_arrays
  check (jsonb_typeof(districts)='array' and jsonb_typeof(layouts)='array'
    and jsonb_typeof(budget_ranges)='array');

create table public.website_revision (
  id text primary key check (id='default'),
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);
alter table public.website_revision enable row level security;
revoke all on public.website_revision from public,anon,authenticated;
grant select on public.website_revision to anon,authenticated,service_role;
create policy website_revision_read on public.website_revision for select
  to anon,authenticated using (id='default');
insert into public.website_revision(id) values('default');

create function private.bump_website_revision() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_table_name='marketing_offers' then
    if not (coalesce(new.publication='Published',false) or coalesce(old.publication='Published',false)) then return null; end if;
  elsif tg_table_name='content_pages' then
    if not (coalesce(new.published_status='Published',false) or coalesce(old.published_status='Published',false)) then return null; end if;
  elsif tg_table_name='content_sections' then
    if not exists(select 1 from public.content_pages where id in(new.page_id,old.page_id) and published_status='Published') then return null; end if;
  elsif tg_table_name in('services','faqs','catalog_documents') then
    if not (coalesce(new.is_published,false) or coalesce(old.is_published,false)) then return null; end if;
  end if;
  update public.website_revision set revision=gen_random_uuid(),updated_at=now() where id='default';
  return null;
end $$;
revoke all on function private.bump_website_revision() from public,anon,authenticated;

create trigger website_revision_changed after insert or update or delete on public.marketing_offers
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.site_settings
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.content_pages
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.content_sections
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.services
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.faqs
  for each row execute function private.bump_website_revision();
create trigger website_revision_changed after insert or update or delete on public.catalog_documents
  for each row execute function private.bump_website_revision();
