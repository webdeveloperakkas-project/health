-- Global Scope 24: reusable, one-time translations.
-- Run this file once in the Supabase SQL Editor.
create table if not exists public.translation_cache (
  cache_key text not null,
  language_code text not null,
  source_hash text not null,
  translated_content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cache_key, language_code)
);

create index if not exists translation_cache_language_idx
  on public.translation_cache (language_code);

alter table public.translation_cache enable row level security;

-- No direct browser access. Only the server-side Edge Function uses the service-role key.
revoke all on table public.translation_cache from anon, authenticated;
