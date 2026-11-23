-- Global Scope 24: manual sitemap approval workflow
-- Run once in Supabase SQL Editor on the existing project.
-- Existing published posts intentionally start as NOT submitted.
-- They will enter sitemap.xml only after an administrator explicitly approves them.

alter table public.posts
  add column if not exists sitemap_submitted boolean not null default false;

alter table public.posts
  add column if not exists sitemap_submitted_at timestamptz;

comment on column public.posts.sitemap_submitted is
  'True only after an administrator explicitly approves this published post for sitemap.xml.';

comment on column public.posts.sitemap_submitted_at is
  'Timestamp of the most recent manual sitemap approval. Null when not submitted.';

create index if not exists posts_sitemap_approval_idx
  on public.posts (published_at desc)
  where status = 'published' and sitemap_submitted = true;

-- No public write permission is added. Existing admin RLS policy remains authoritative.
