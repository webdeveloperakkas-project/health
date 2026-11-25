-- Global Scope 24: store multiple language versions on one post.
-- Run once in the Supabase SQL Editor before using the updated Admin Panel.

alter table public.posts
  add column if not exists translations jsonb not null default '{}'::jsonb,
  add column if not exists post_languages text[] not null default array[]::text[];

-- Preserve every existing post in its current supported language.
update public.posts
set translations = jsonb_build_object(
      case when language in ('bn','en','hi') then language else 'en' end,
      jsonb_build_object(
        'title', coalesce(title, ''),
        'content_html', coalesce(content_html, ''),
        'excerpt', coalesce(excerpt, '')
      )
    )
where translations = '{}'::jsonb;

-- Existing posts retain their current language selection.
update public.posts
set post_languages = array[case when language in ('bn','en','hi') then language else 'en' end]::text[]
where cardinality(post_languages) = 0;

