-- Adds flexible per-template-type data to posts (poll options, quote
-- attribution, quick-tip emoji, lesson topic tag) without a column per type.
alter table posts
  add column metadata jsonb not null default '{}'::jsonb;
