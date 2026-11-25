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

-- Basic server-side protection against accidental or abusive Gemini generation.
create table if not exists public.translation_rate_limits (
  client_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0
);

alter table public.translation_rate_limits enable row level security;
revoke all on table public.translation_rate_limits from anon, authenticated;

create or replace function public.check_translation_rate_limit(
  p_client_key text,
  p_limit integer default 30
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  current_window timestamptz := date_trunc('minute', now());
begin
  insert into public.translation_rate_limits (client_key, window_started_at, request_count)
  values (p_client_key, current_window, 1)
  on conflict (client_key) do update
    set window_started_at = case
          when translation_rate_limits.window_started_at < current_window then current_window
          else translation_rate_limits.window_started_at
        end,
        request_count = case
          when translation_rate_limits.window_started_at < current_window then 1
          else translation_rate_limits.request_count + 1
        end
  returning request_count into current_count;

  return current_count <= greatest(1, least(p_limit, 60));
end;
$$;

revoke all on function public.check_translation_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.check_translation_rate_limit(text, integer) to service_role;
