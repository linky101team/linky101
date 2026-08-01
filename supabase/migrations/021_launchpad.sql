-- ===========================================================================
-- Launchpad: regions, roles, and the Dream Wall
-- ===========================================================================
-- NOTE ON DRIFT: the live database has diverged from these migration files.
-- It already contained a `role` column on profiles (holding values outside
-- founder/ambassador) and a `dreams` table with a different shape
-- (profile_id/text rather than author_id/body). This migration is written to
-- survive both instead of assuming a clean schema.

-- ---------------------------------------------------------------------------
-- Age range fix
--
-- The platform is advertised to 13-19 year olds, but the original constraint
-- capped age at 18 — a 19 year old could not create an account at all.
-- ---------------------------------------------------------------------------
alter table profiles drop constraint if exists profiles_age_check;
alter table profiles add constraint profiles_age_check check (age >= 13 and age <= 19);

-- ---------------------------------------------------------------------------
-- Region + role
--
-- `role` is deliberately limited to founder/ambassador. "Mentor" is NOT a
-- self-selectable role: mentors are hand-picked, DBS-checked adults and live
-- in the separate `mentors` table. Nobody can promote themselves to one.
--
-- Unrecognised existing values are preserved in `role_legacy` before being
-- normalised, so nothing is destroyed. Admin rights live on `profiles.is_admin`
-- and mentors live in `mentors`, so neither is affected by this.
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists region text;
alter table profiles add column if not exists role text not null default 'founder';
alter table profiles add column if not exists role_legacy text;

update profiles
   set role_legacy = role
 where role is not null
   and role not in ('founder', 'ambassador')
   and role_legacy is null;

update profiles
   set role = 'founder'
 where role is null
    or role not in ('founder', 'ambassador');

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('founder', 'ambassador'));

-- Ambassadors are adults and must clear an over-18 check before their profile
-- is publicly listed. Unverified ambassadors stay hidden.
alter table profiles add column if not exists ambassador_verified boolean not null default false;

create index if not exists idx_profiles_region on profiles (region);
create index if not exists idx_profiles_role on profiles (role);

-- ---------------------------------------------------------------------------
-- Dream Wall
--
-- Deliberately NOT called `dreams`: a table of that name already exists in the
-- live database with an incompatible shape. Rather than migrate or drop
-- somebody's existing data blind, the Dream Wall gets its own clearly-named
-- tables. The legacy `dreams` table is left untouched — review and drop it
-- separately once you've confirmed nothing depends on it.
-- ---------------------------------------------------------------------------
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
