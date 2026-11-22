-- Global Scope 24: rolling seven-day trending view tracking
-- Run once in Supabase SQL Editor. Existing posts are included automatically
-- as soon as new views are recorded; lifetime views are not backfilled as
-- seven-day views because their original timestamps are unavailable.

create table if not exists public.post_view_events (
  id bigint generated always as identity primary key,
  post_id text not null references public.posts(id) on delete cascade,
  visitor_id uuid not null,
  viewed_at timestamptz not null default now()
);

create index if not exists post_view_events_recent_idx
  on public.post_view_events (viewed_at desc, post_id);

create index if not exists post_view_events_visitor_post_idx
  on public.post_view_events (visitor_id, post_id, viewed_at desc);

alter table public.post_view_events enable row level security;
revoke all on public.post_view_events from anon, authenticated;

create or replace function public.record_post_view(
  p_post_id text,
  p_visitor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_post_id is null or p_visitor_id is null then
    return;
  end if;

  if not exists (
    select 1
    from public.posts
    where id = p_post_id
      and status = 'published'
  ) then
    return;
  end if;

  -- Count one view per visitor per post within a rolling 30-minute window.
  if not exists (
    select 1
    from public.post_view_events
    where post_id = p_post_id
      and visitor_id = p_visitor_id
      and viewed_at >= now() - interval '30 minutes'
  ) then
    insert into public.post_view_events (post_id, visitor_id)
    values (p_post_id, p_visitor_id);
  end if;
end;
$$;

create or replace function public.get_trending_posts()
returns table (
  post_id text,
  view_count bigint,
  last_viewed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    events.post_id,
    count(*)::bigint as view_count,
    max(events.viewed_at) as last_viewed_at
  from public.post_view_events as events
  inner join public.posts as published_posts
    on published_posts.id = events.post_id
   and published_posts.status = 'published'
  where events.viewed_at >= now() - interval '7 days'
  group by events.post_id
  order by count(*) desc, max(events.viewed_at) desc
  limit 10;
$$;

revoke all on function public.record_post_view(text, uuid) from public;
revoke all on function public.get_trending_posts() from public;
grant execute on function public.record_post_view(text, uuid) to anon, authenticated;
grant execute on function public.get_trending_posts() to anon, authenticated;
