-- Global Scope 24: rolling seven-day Most Read ranking
-- This ranks published articles by views recorded during the last seven days.
-- For posts published within that same seven-day window, the stored views
-- counter is also valid because all of those views occurred after publication.

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

drop function if exists public.get_trending_posts();

create or replace function public.get_most_read_posts()
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
  with recent_events as (
    select
      events.post_id,
      count(*)::bigint as event_views,
      max(events.viewed_at) as last_event_at
    from public.post_view_events as events
    where events.viewed_at >= now() - interval '7 days'
    group by events.post_id
  ),
  ranked_posts as (
    select
      published_posts.id as post_id,
      case
        -- For a post published in the last seven days, its existing
        -- lifetime views are necessarily within the same seven-day window.
        -- greatest() prevents counting a new event twice if another
        -- process also updates public.posts.views.
        when coalesce(published_posts.published_at, published_posts.created_at)
             >= now() - interval '7 days'
          then greatest(
            coalesce(published_posts.views, 0)::bigint,
            coalesce(recent_events.event_views, 0)::bigint
          )
        else coalesce(recent_events.event_views, 0)::bigint
      end as view_count,
      greatest(
        coalesce(recent_events.last_event_at, '-infinity'::timestamptz),
        coalesce(published_posts.published_at, published_posts.created_at)
      ) as last_viewed_at
    from public.posts as published_posts
    left join recent_events on recent_events.post_id = published_posts.id
    where published_posts.status = 'published'
  )
  select
    ranked_posts.post_id,
    ranked_posts.view_count,
    ranked_posts.last_viewed_at
  from ranked_posts
  where ranked_posts.view_count > 0
  order by ranked_posts.view_count desc, ranked_posts.last_viewed_at desc
  limit 14;
$$;

revoke all on function public.record_post_view(text, uuid) from public;
grant execute on function public.record_post_view(text, uuid) to anon, authenticated;
revoke all on function public.get_most_read_posts() from public;
grant execute on function public.get_most_read_posts() to anon, authenticated;
