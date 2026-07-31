-- LinkY101 initial schema
-- Networking + entrepreneurship platform for ages 13-18, with gamification.

create extension if not exists pgcrypto;

-- =========================================================================
-- TABLES
-- =========================================================================

-- schools -----------------------------------------------------------------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text,
  is_premium_school boolean not null default false,
  team_xp integer not null default 0,
  created_at timestamptz not null default now()
);

-- profiles ------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  age integer not null check (age >= 13 and age <= 18),
  school_type text check (school_type in ('school', 'homeschool', 'no_school_yet')),
  school_id uuid references schools (id) on delete set null,
  dream text check (char_length(dream) <= 500),
  headline text check (char_length(headline) <= 200),
  level integer not null default 1,
  xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  is_premium boolean not null default false,
  premium_until timestamptz,
  avatar_url text,
  profile_flair jsonb not null default '{}'::jsonb,
  interests text[] not null default '{}'::text[],
  onboarding_completed boolean not null default false,
  completed_tours text[] not null default '{}'::text[],
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_school_id on profiles (school_id);

-- posts ---------------------------------------------------------------------
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  category text not null check (category in ('win', 'question', 'idea', 'tip', 'tool_review', 'motivation')),
  template_type text,
  title text,
  body text,
  is_gold boolean not null default false,
  is_hidden boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  feed_type text not null check (feed_type in ('learn', 'community')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_feed_category_created on posts (feed_type, category, created_at desc);
create index idx_posts_author_id on posts (author_id);

-- reactions -------------------------------------------------------------
create table reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('fire', 'lightbulb', 'rocket', 'heart', 'clap')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

create index idx_reactions_post_id on reactions (post_id);

-- comments --------------------------------------------------------------
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  is_preset boolean not null default false,
  moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index idx_comments_post_id on comments (post_id);

-- daily_tasks -------------------------------------------------------------
create table daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  task_type text not null,
  description text,
  xp_reward integer not null default 0,
  is_completed boolean not null default false,
  task_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_daily_tasks_user_date on daily_tasks (user_id, task_date);

-- daily_spins -------------------------------------------------------------
create table daily_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  spin_date date not null default current_date,
  prize_type text not null,
  prize_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, spin_date)
);

-- achievements ------------------------------------------------------------
create table achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  xp_reward integer not null default 0,
  category text,
  requirement_type text,
  requirement_value integer,
  created_at timestamptz not null default now()
);

-- user_achievements ---------------------------------------------------------
create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index idx_user_achievements_user_id on user_achievements (user_id);

-- quizzes -------------------------------------------------------------------
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  min_level integer not null default 1,
  question_count integer not null default 0,
  time_limit_seconds integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- quiz_questions --------------------------------------------------------
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  explanation text,
  order_index integer not null default 0
);

create index idx_quiz_questions_quiz_id on quiz_questions (quiz_id);

-- quiz_attempts -----------------------------------------------------------
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  quiz_id uuid not null references quizzes (id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  xp_earned integer not null default 0,
  completed_at timestamptz not null default now()
);

create index idx_quiz_attempts_user_id on quiz_attempts (user_id);

-- opportunities -----------------------------------------------------------
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('competition', 'grant', 'work_experience', 'mentorship', 'event', 'resource')),
  age_min integer,
  age_max integer,
  deadline date,
  link text,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_opportunities_is_active on opportunities (is_active);

-- saved_opportunities -------------------------------------------------------
create table saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  has_applied boolean not null default false,
  saved_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index idx_saved_opportunities_user_id on saved_opportunities (user_id);

-- follows -------------------------------------------------------------------
create table follows (
  follower_id uuid not null references profiles (id) on delete cascade,
  following_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index idx_follows_following_id on follows (following_id);

-- mentors -------------------------------------------------------------------
create table mentors (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  bio text,
  expertise text[] not null default '{}'::text[],
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- mentor_questions ------------------------------------------------------
create table mentor_questions (
  id uuid primary key default gen_random_uuid(),
  asked_by uuid not null references profiles (id) on delete cascade,
  mentor_id uuid references mentors (id) on delete set null,
  question_text text not null,
  answer_text text,
  answered_by uuid references mentors (id) on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index idx_mentor_questions_mentor_id on mentor_questions (mentor_id);
create index idx_mentor_questions_asked_by on mentor_questions (asked_by);

-- events ----------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text not null check (event_type in ('masterclass', 'challenge', 'workshop', 'q_and_a')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_premium_only boolean not null default false,
  max_attendees integer,
  xp_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_events_starts_at on events (starts_at);

-- event_attendees -------------------------------------------------------
create table event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index idx_event_attendees_user_id on event_attendees (user_id);

-- reports -----------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  reported_type text not null check (reported_type in ('post', 'comment', 'profile', 'mentor')),
  reported_id uuid not null,
  category text not null check (category in ('inappropriate', 'bullying', 'spam', 'personal_info', 'uncomfortable', 'other')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index idx_reports_status on reports (status);

-- notifications -----------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_read on notifications (user_id, is_read);

-- team_challenges -----------------------------------------------------------
create table team_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  challenge_type text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  xp_reward_per_member integer not null default 0,
  created_at timestamptz not null default now()
);

-- team_challenge_progress ----------------------------------------------
create table team_challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references team_challenges (id) on delete cascade,
  school_id uuid not null references schools (id) on delete cascade,
  progress_value integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, school_id)
);

-- user_warnings -----------------------------------------------------------
create table user_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  warning_type text not null check (warning_type in ('content_removed', 'posting_restriction', 'suspension', 'ban')),
  reason text,
  duration_hours integer,
  issued_at timestamptz not null default now(),
  expires_at timestamptz
);

create index idx_user_warnings_user_id on user_warnings (user_id);

-- poll_votes ----------------------------------------------------------------
create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  option_index integer not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- =========================================================================
-- HELPER FUNCTIONS
-- =========================================================================

-- Bypasses RLS deliberately (security definer) so policies elsewhere can
-- check admin status on `profiles` without recursing into its own RLS.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $is_admin$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$is_admin$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $set_updated_at$
begin
  new.updated_at = now();
  return new;
end;
$set_updated_at$;

-- Only admins may change a post/comment's moderation fields; authors can
-- still edit their own content otherwise.
create or replace function prevent_moderation_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent_moderation_field_update$
begin
  if not is_admin() then
    if new.moderation_status is distinct from old.moderation_status then
      raise exception 'Only admins can change moderation_status';
    end if;
    if tg_table_name = 'posts' then
      if new.is_gold is distinct from old.is_gold then
        raise exception 'Only admins can change is_gold';
      end if;
      if new.is_hidden is distinct from old.is_hidden then
        raise exception 'Only admins can change is_hidden';
      end if;
    end if;
  end if;
  return new;
end;
$prevent_moderation_field_update$;

-- Blocks self-service edits to privilege/gamification fields on `profiles`.
-- `increment_xp` bypasses this via the `linky101.bypass_profile_lock` GUC.
create or replace function prevent_privileged_profile_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent_privileged_profile_field_update$
begin
  if not is_admin()
     and coalesce(current_setting('linky101.bypass_profile_lock', true), 'false') <> 'true'
  then
    if new.is_admin is distinct from old.is_admin
      or new.is_premium is distinct from old.is_premium
      or new.premium_until is distinct from old.premium_until
      or new.xp is distinct from old.xp
      or new.level is distinct from old.level
      or new.current_streak is distinct from old.current_streak
      or new.longest_streak is distinct from old.longest_streak
      or new.profile_flair is distinct from old.profile_flair
    then
      raise exception 'Cannot modify privileged profile fields directly';
    end if;
  end if;
  return new;
end;
$prevent_privileged_profile_field_update$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_profiles_privileged_lock
  before update on profiles
  for each row execute function prevent_privileged_profile_field_update();

create trigger trg_posts_updated_at
  before update on posts
  for each row execute function set_updated_at();

create trigger trg_posts_moderation_lock
  before update on posts
  for each row execute function prevent_moderation_field_update();

create trigger trg_comments_moderation_lock
  before update on comments
  for each row execute function prevent_moderation_field_update();

create trigger trg_team_challenge_progress_updated_at
  before update on team_challenge_progress
  for each row execute function set_updated_at();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table profiles enable row level security;
alter table schools enable row level security;
alter table posts enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;
alter table daily_tasks enable row level security;
alter table daily_spins enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table opportunities enable row level security;
alter table saved_opportunities enable row level security;
alter table follows enable row level security;
alter table mentors enable row level security;
alter table mentor_questions enable row level security;
alter table events enable row level security;
alter table event_attendees enable row level security;
alter table reports enable row level security;
alter table notifications enable row level security;
alter table team_challenges enable row level security;
alter table team_challenge_progress enable row level security;
alter table user_warnings enable row level security;
alter table poll_votes enable row level security;

-- profiles --------------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- schools -----------------------------------------------------------------
create policy "Schools are viewable by everyone"
  on schools for select
  using (true);

create policy "Admins can manage schools"
  on schools for all
  using (is_admin())
  with check (is_admin());

-- posts -------------------------------------------------------------------
create policy "Approved posts are viewable by everyone, own/all posts by author/admin"
  on posts for select
  using (
    (moderation_status = 'approved' and is_hidden = false)
    or author_id = auth.uid()
    or is_admin()
  );

create policy "Users can insert own posts"
  on posts for insert
  with check (author_id = auth.uid());

create policy "Authors and admins can update posts"
  on posts for update
  using (author_id = auth.uid() or is_admin())
  with check (author_id = auth.uid() or is_admin());

create policy "Authors and admins can delete posts"
  on posts for delete
  using (author_id = auth.uid() or is_admin());

-- reactions -----------------------------------------------------------------
create policy "Reactions are viewable by everyone"
  on reactions for select
  using (true);

create policy "Users can insert own reactions"
  on reactions for insert
  with check (user_id = auth.uid());

create policy "Users can remove own reactions"
  on reactions for delete
  using (user_id = auth.uid());

-- comments --------------------------------------------------------------
create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Users can insert own comments"
  on comments for insert
  with check (author_id = auth.uid());

create policy "Authors and admins can update comments"
  on comments for update
  using (author_id = auth.uid() or is_admin())
  with check (author_id = auth.uid() or is_admin());

create policy "Authors and admins can delete comments"
  on comments for delete
  using (author_id = auth.uid() or is_admin());

-- daily_tasks ---------------------------------------------------------------
create policy "Users can view own daily tasks"
  on daily_tasks for select
  using (user_id = auth.uid());

create policy "Users can insert own daily tasks"
  on daily_tasks for insert
  with check (user_id = auth.uid());

create policy "Users can update own daily tasks"
  on daily_tasks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- daily_spins -----------------------------------------------------------
create policy "Users can view own daily spins"
  on daily_spins for select
  using (user_id = auth.uid());

create policy "Users can insert own daily spins"
  on daily_spins for insert
  with check (user_id = auth.uid());

-- achievements ------------------------------------------------------------
create policy "Achievements are viewable by everyone"
  on achievements for select
  using (true);

create policy "Admins can manage achievements"
  on achievements for all
  using (is_admin())
  with check (is_admin());

-- user_achievements ---------------------------------------------------------
create policy "Earned achievements are viewable by everyone"
  on user_achievements for select
  using (true);

create policy "Admins can manage user achievements"
  on user_achievements for all
  using (is_admin())
  with check (is_admin());

-- quizzes -------------------------------------------------------------------
create policy "Active quizzes are viewable by everyone"
  on quizzes for select
  using (is_active = true or is_admin());

create policy "Admins can manage quizzes"
  on quizzes for all
  using (is_admin())
  with check (is_admin());

-- quiz_questions --------------------------------------------------------
create policy "Quiz questions are viewable by everyone"
  on quiz_questions for select
  using (true);

create policy "Admins can manage quiz questions"
  on quiz_questions for all
  using (is_admin())
  with check (is_admin());

-- quiz_attempts -----------------------------------------------------------
create policy "Users can view own quiz attempts"
  on quiz_attempts for select
  using (user_id = auth.uid());

create policy "Users can insert own quiz attempts"
  on quiz_attempts for insert
  with check (user_id = auth.uid());

-- opportunities -------------------------------------------------------------
create policy "Active opportunities are viewable by everyone"
  on opportunities for select
  using (is_active = true or is_admin());

create policy "Admins can manage opportunities"
  on opportunities for all
  using (is_admin())
  with check (is_admin());

-- saved_opportunities -------------------------------------------------------
create policy "Users can view own saved opportunities"
  on saved_opportunities for select
  using (user_id = auth.uid());

create policy "Users can insert own saved opportunities"
  on saved_opportunities for insert
  with check (user_id = auth.uid());

create policy "Users can update own saved opportunities"
  on saved_opportunities for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can remove own saved opportunities"
  on saved_opportunities for delete
  using (user_id = auth.uid());

-- follows -----------------------------------------------------------------
create policy "Follows are viewable by everyone"
  on follows for select
  using (true);

create policy "Users can insert own follows"
  on follows for insert
  with check (follower_id = auth.uid());

create policy "Users can remove own follows"
  on follows for delete
  using (follower_id = auth.uid());

-- mentors -------------------------------------------------------------------
create policy "Active mentors are viewable by everyone"
  on mentors for select
  using (is_active = true or id = auth.uid() or is_admin());

create policy "Users can register as a mentor"
  on mentors for insert
  with check (id = auth.uid());

create policy "Mentors and admins can update mentor profile"
  on mentors for update
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- mentor_questions ------------------------------------------------------
create policy "Public mentor questions and own questions are viewable"
  on mentor_questions for select
  using (
    is_public = true
    or asked_by = auth.uid()
    or mentor_id = auth.uid()
    or is_admin()
  );

create policy "Users can insert own mentor questions"
  on mentor_questions for insert
  with check (asked_by = auth.uid());

create policy "Mentors and admins can answer questions"
  on mentor_questions for update
  using (
    is_admin()
    or mentor_id = auth.uid()
    or (
      mentor_id is null
      and exists (
        select 1 from mentors m
        where m.id = auth.uid() and m.is_active = true
      )
    )
  )
  with check (
    is_admin()
    or mentor_id = auth.uid()
    or answered_by = auth.uid()
  );

-- events ----------------------------------------------------------------
create policy "Events are viewable by everyone"
  on events for select
  using (true);

create policy "Admins can manage events"
  on events for all
  using (is_admin())
  with check (is_admin());

-- event_attendees -------------------------------------------------------
create policy "Users can view own event registrations"
  on event_attendees for select
  using (user_id = auth.uid() or is_admin());

create policy "Users can register for events"
  on event_attendees for insert
  with check (user_id = auth.uid());

create policy "Users can cancel own event registration"
  on event_attendees for delete
  using (user_id = auth.uid());

-- reports -----------------------------------------------------------------
create policy "Users can insert own reports"
  on reports for insert
  with check (reporter_id = auth.uid());

create policy "Admins can view reports"
  on reports for select
  using (is_admin());

create policy "Admins can update reports"
  on reports for update
  using (is_admin())
  with check (is_admin());

-- notifications -----------------------------------------------------------
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- team_challenges -----------------------------------------------------------
create policy "Team challenges are viewable by everyone"
  on team_challenges for select
  using (true);

create policy "Admins can manage team challenges"
  on team_challenges for all
  using (is_admin())
  with check (is_admin());

-- team_challenge_progress ----------------------------------------------
create policy "Team challenge progress is viewable by everyone"
  on team_challenge_progress for select
  using (true);

create policy "Admins can manage team challenge progress"
  on team_challenge_progress for all
  using (is_admin())
  with check (is_admin());

-- user_warnings -----------------------------------------------------------
create policy "Users can view own warnings"
  on user_warnings for select
  using (user_id = auth.uid() or is_admin());

create policy "Admins can manage warnings"
  on user_warnings for insert
  with check (is_admin());

create policy "Admins can update warnings"
  on user_warnings for update
  using (is_admin())
  with check (is_admin());

-- poll_votes ----------------------------------------------------------------
create policy "Poll votes are viewable by everyone"
  on poll_votes for select
  using (true);

create policy "Users can insert own poll vote"
  on poll_votes for insert
  with check (user_id = auth.uid());

-- =========================================================================
-- BUSINESS LOGIC FUNCTIONS
-- =========================================================================

-- Maps a total XP value to its level per the fixed threshold table below.
create or replace function xp_to_level(p_xp integer)
returns integer
language sql
immutable
as $xp_to_level$
  select t.level
  from (
    values
      (1, 0), (2, 50), (3, 100), (4, 200), (5, 400),
      (6, 600), (7, 800), (8, 1000), (9, 1100), (10, 1200),
      (11, 1400), (12, 1600), (13, 1800), (14, 2100), (15, 2500),
      (16, 3000), (17, 3500), (18, 4000), (19, 4500), (20, 5000),
      (21, 6000), (22, 7000), (23, 8000), (24, 9000), (25, 10000),
      (26, 12000), (27, 14000), (28, 16000), (29, 18000), (30, 20000)
  ) as t(level, xp_required)
  where t.xp_required <= p_xp
  order by t.level desc
  limit 1;
$xp_to_level$;

-- Adds XP to a profile, recalculates level, and reports whether it changed.
create or replace function increment_xp(user_id uuid, amount integer)
returns table (new_xp integer, new_level integer, leveled_up boolean)
language plpgsql
security definer
set search_path = public
as $increment_xp$
declare
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
begin
  select p.level into v_old_level
  from profiles p
  where p.id = user_id;

  if not found then
    raise exception 'Profile % not found', user_id;
  end if;

  -- Local to this transaction; lets this function write xp/level through
  -- the trg_profiles_privileged_lock trigger without granting is_admin().
  perform set_config('linky101.bypass_profile_lock', 'true', true);

  update profiles
  set xp = xp + amount
  where id = user_id
  returning xp into v_new_xp;

  v_new_level := xp_to_level(v_new_xp);

  if v_new_level is distinct from v_old_level then
    update profiles
    set level = v_new_level
    where id = user_id;
  end if;

  return query select v_new_xp, v_new_level, (v_new_level > v_old_level);
end;
$increment_xp$;

-- Inserts a notification for a user.
create or replace function create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $create_notification$
declare
  v_id uuid;
begin
  insert into notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link)
  returning id into v_id;

  return v_id;
end;
$create_notification$;
