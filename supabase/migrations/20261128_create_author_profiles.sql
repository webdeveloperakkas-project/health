-- Global Scope 24: reusable author profiles and immutable post byline snapshots
-- Run once in the Supabase SQL Editor before using Author Profile in the CMS.
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  photo_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.authors enable row level security;
drop policy if exists "Public can read author profiles" on public.authors;
create policy "Public can read author profiles" on public.authors for select to anon, authenticated using (true);
drop policy if exists "Admins can insert author profiles" on public.authors;
create policy "Admins can insert author profiles" on public.authors for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can update author profiles" on public.authors;
create policy "Admins can update author profiles" on public.authors for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete author profiles" on public.authors;
create policy "Admins can delete author profiles" on public.authors for delete to authenticated using (public.is_admin());
alter table public.posts
  add column if not exists author_id uuid references public.authors(id) on delete set null,
  add column if not exists author_name text,
  add column if not exists author_photo_url text;
create index if not exists posts_author_id_idx on public.posts(author_id);
