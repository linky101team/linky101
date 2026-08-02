-- ============================================================
-- LinkY101 · Dream Wall
-- Paste the whole file into Supabase -> SQL Editor -> Run.
-- Click once in the editor first so nothing is highlighted.
-- Safe to run more than once.
-- ============================================================

create table if not exists dream_wall_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  region text,
  moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_dream_wall_posts_author on dream_wall_posts (author_id);
create index if not exists idx_dream_wall_posts_created on dream_wall_posts (created_at desc);

create table if not exists dream_wall_likes (
  post_id uuid not null references dream_wall_posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table dream_wall_posts enable row level security;
alter table dream_wall_likes enable row level security;

drop policy if exists "Approved dream wall posts are viewable by everyone" on dream_wall_posts;
create policy "Approved dream wall posts are viewable by everyone"
  on dream_wall_posts for select
  using (
    moderation_status = 'approved'
    or author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "Users can insert own dream wall posts" on dream_wall_posts;
create policy "Users can insert own dream wall posts"
  on dream_wall_posts for insert
  with check (author_id = auth.uid());

drop policy if exists "Authors and admins can update dream wall posts" on dream_wall_posts;
create policy "Authors and admins can update dream wall posts"
  on dream_wall_posts for update
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "Authors and admins can delete dream wall posts" on dream_wall_posts;
create policy "Authors and admins can delete dream wall posts"
  on dream_wall_posts for delete
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "Dream wall likes are viewable by everyone" on dream_wall_likes;
create policy "Dream wall likes are viewable by everyone"
  on dream_wall_likes for select
  using (true);

drop policy if exists "Users can like as themselves" on dream_wall_likes;
create policy "Users can like as themselves"
  on dream_wall_likes for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can remove own dream wall likes" on dream_wall_likes;
create policy "Users can remove own dream wall likes"
  on dream_wall_likes for delete
  using (user_id = auth.uid());

select 'dream wall ready' as status;
