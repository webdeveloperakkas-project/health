-- Global Scope 24: optional AI-generated cover illustration disclosure.
-- Run once in the Supabase SQL Editor before using the new Admin Panel checkbox.

alter table public.posts
  add column if not exists cover_caption_enabled boolean not null default false;
