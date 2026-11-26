-- Everyday Atlas: initial Supabase schema
-- Run this file in Supabase SQL Editor after creating the first admin Auth user.
-- Then add that user's UUID to public.admin_users using the SQL shown in the setup guide.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.posts (
  id text primary key,
  title text not null,
  content_html text not null default '',
  category text not null,
  subcategory text not null default '',
  language text not null default 'bn',
  translations jsonb not null default '{}'::jsonb,
  post_languages text[] not null default array['bn']::text[],
  post_types text[] not null default array['latest']::text[],
  featured_stories boolean not null default false,
  status text not null default 'draft',
  scheduled_at timestamptz,
  excerpt text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  focus_keyword text not null default '',
  related_keywords text[] not null default '{}'::text[],
  keywords text[] not null default '{}'::text[],
  video_url text not null default '',
  cover_url text not null default '',
  cover_caption_enabled boolean not null default false,
  views bigint not null default 0 check (views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.posts add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.posts add column if not exists post_languages text[] not null default array['bn']::text[];
alter table public.posts add column if not exists scheduled_at timestamptz;
alter table public.posts add column if not exists meta_title text not null default '';
alter table public.posts add column if not exists meta_description text not null default '';
alter table public.posts add column if not exists focus_keyword text not null default '';
alter table public.posts add column if not exists related_keywords text[] not null default '{}'::text[];
alter table public.posts add column if not exists sitemap_submitted boolean not null default false;
alter table public.posts add column if not exists sitemap_submitted_at timestamptz;
alter table public.posts add column if not exists cover_caption_enabled boolean not null default false;
alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check check (status in ('draft', 'scheduled', 'published'));

create index if not exists posts_schedule_idx on public.posts (scheduled_at) where status = 'scheduled';

create index if not exists posts_publication_idx
  on public.posts (status, published_at desc);

create index if not exists posts_sitemap_approval_idx
  on public.posts (published_at desc)
  where status = 'published' and sitemap_submitted = true;
create index if not exists posts_category_idx
  on public.posts (category, status);

create table if not exists public.headlines (
  id text primary key,
  text text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.headlines enable row level security;

revoke all on public.admin_users from anon, authenticated;
grant select on public.posts, public.headlines to anon, authenticated;
grant insert, update, delete on public.posts, public.headlines to authenticated;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
  on public.posts for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
  on public.posts for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read active headlines" on public.headlines;
create policy "Public can read active headlines"
  on public.headlines for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage headlines" on public.headlines;
create policy "Admins can manage headlines"
  on public.headlines for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'everyday-atlas-media',
  'everyday-atlas-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view Everyday Atlas media" on storage.objects;
create policy "Public can view Everyday Atlas media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'everyday-atlas-media');

drop policy if exists "Admins can upload Everyday Atlas media" on storage.objects;
create policy "Admins can upload Everyday Atlas media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'everyday-atlas-media' and public.is_admin());

drop policy if exists "Admins can update Everyday Atlas media" on storage.objects;
create policy "Admins can update Everyday Atlas media"
  on storage.objects for update to authenticated
  using (bucket_id = 'everyday-atlas-media' and public.is_admin())
  with check (bucket_id = 'everyday-atlas-media' and public.is_admin());

drop policy if exists "Admins can delete Everyday Atlas media" on storage.objects;
create policy "Admins can delete Everyday Atlas media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'everyday-atlas-media' and public.is_admin());
