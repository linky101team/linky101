-- Schema additions needed for the Teams, Tasks/Spin, Quiz, and Profile
-- Settings pages: a measurable goal for team challenges, a queryable
-- source for "level up" activity events, support for a second premium
-- daily spin, a quiz XP value, and a home for self-editable privacy
-- toggles.

-- team_challenges: progress bars need something to divide by.
alter table team_challenges
  add column goal_value integer not null default 100;

-- quizzes: cards need a headline XP value.
alter table quizzes
  add column xp_reward integer not null default 50;

-- profiles: privacy toggles are ordinary user-editable settings, not a
-- privileged/gamification field, so this column is intentionally left out
-- of prevent_privileged_profile_field_update()'s locked list.
alter table profiles
  add column privacy_settings jsonb not null default '{}'::jsonb;

-- activity_log: the only queryable source for "level up" events — profiles
-- only stores the current level, not level-change history.
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  activity_type text not null check (activity_type in ('level_up')),
  description text not null,
  created_at timestamptz not null default now()
);

create index idx_activity_log_user_created on activity_log (user_id, created_at desc);

alter table activity_log enable row level security;

create policy "Activity log is viewable by everyone"
  on activity_log for select
  using (true);

create or replace function log_level_up()
returns trigger
language plpgsql
security definer
set search_path = public
as $log_level_up$
begin
  if new.level is distinct from old.level and new.level > old.level then
    insert into activity_log (user_id, activity_type, description)
    values (new.id, 'level_up', 'Reached Level ' || new.level);
  end if;
  return new;
end;
$log_level_up$;

create trigger trg_profiles_log_level_up
  after update on profiles
  for each row execute function log_level_up();

-- daily_spins: premium members get a second spin per day, so "one row per
-- user per day" no longer holds — track a spin number within the day instead.
alter table daily_spins
  drop constraint daily_spins_user_id_spin_date_key;

alter table daily_spins
  add column spin_number integer not null default 1;

alter table daily_spins
  add constraint daily_spins_user_id_spin_date_spin_number_key
  unique (user_id, spin_date, spin_number);

-- Applies the effect of a non-XP daily-spin prize. XP prizes still go
-- through increment_xp directly from the calling action. This bypasses the
-- profile lock (for level_skip/streak_shield/profile_flair) the same way
-- increment_xp does, and is the one sanctioned way a regular member can
-- move their school's team_xp (normally admin-only).
create or replace function apply_spin_prize(p_prize_type text, p_prize_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $apply_spin_prize$
declare
  v_school_id uuid;
begin
  if p_prize_type = 'streak_shield' then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles
    set profile_flair = profile_flair
      || jsonb_build_object(
           'streak_shields',
           coalesce((profile_flair->>'streak_shields')::integer, 0) + p_prize_amount
         )
    where id = auth.uid();

  elsif p_prize_type = 'profile_flair' then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles
    set profile_flair = profile_flair
      || jsonb_build_object(
           'flair_count',
           coalesce((profile_flair->>'flair_count')::integer, 0) + 1
         )
    where id = auth.uid();

  elsif p_prize_type = 'level_skip' then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles
    set level = least(30, level + 1)
    where id = auth.uid();

  elsif p_prize_type = 'team_boost' then
    select school_id into v_school_id from profiles where id = auth.uid();
    if v_school_id is not null then
      update schools set team_xp = team_xp + p_prize_amount where id = v_school_id;
    end if;
  end if;
end;
$apply_spin_prize$;
