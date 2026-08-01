-- ===========================================================================
-- Launchpad: regions, roles, and the Dream Wall
-- ===========================================================================

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
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists region text;
alter table profiles add column if not exists role text not null default 'founder';

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('founder', 'ambassador'));

-- Ambassadors are adults and must clear an over-18 check before their profile
-- is publicly listed. Unverified ambassadors stay hidden.
alter table profiles add column if not exists ambassador_verified boolean not null default false;

create index if not exists idx_profiles_region on profiles (region);
create index if not exists idx_profiles_role on profiles (role);

-- ---------------------------------------------------------------------------
-- Dream Wall
-- ---------------------------------------------------------------------------
create table if not exists dreams (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  region text,
  moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_dreams_author_id on dreams (author_id);
create index if not exists idx_dreams_created_at on dreams (created_at desc);

create table if not exists dream_likes (
  dream_id uuid not null references dreams (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (dream_id, user_id)
);

alter table dreams enable row level security;
alter table dream_likes enable row level security;

create policy "Approved dreams are viewable by everyone"
  on dreams for select
  using (
    moderation_status = 'approved'
    or author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "Users can insert own dreams"
  on dreams for insert
  with check (author_id = auth.uid());

create policy "Authors and admins can update dreams"
  on dreams for update
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "Authors and admins can delete dreams"
  on dreams for delete
  using (
    author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "Dream likes are viewable by everyone"
  on dream_likes for select
  using (true);

create policy "Users can like as themselves"
  on dream_likes for insert
  with check (user_id = auth.uid());

create policy "Users can remove own likes"
  on dream_likes for delete
  using (user_id = auth.uid());
