-- Global Scope 24: Biography metadata
-- Run once in the Supabase SQL Editor before saving Biography posts.
alter table public.posts
  add column if not exists biography_person_type text,
  add column if not exists biography_person_name text,
  add column if not exists biography_country text;

create index if not exists posts_biography_country_idx
  on public.posts (biography_country)
  where category = 'biography' and status = 'published';

create index if not exists posts_biography_type_idx
  on public.posts (biography_person_type)
  where category = 'biography' and status = 'published';

create index if not exists posts_biography_name_idx
  on public.posts (biography_person_name)
  where category = 'biography' and status = 'published';
