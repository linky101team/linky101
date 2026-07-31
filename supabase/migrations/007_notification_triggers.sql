-- Notification triggers: event-based ones fire immediately via Postgres
-- triggers. Time-based ones (daily_tasks_reminder, streak_at_risk,
-- event_starting) can't be triggers — Postgres triggers fire on row
-- changes, not wall-clock time — so they're plain SQL functions scheduled
-- with pg_cron below. pg_cron must be enabled for this project (Supabase
-- dashboard: Database > Extensions) for those three to actually fire;
-- everything else in this file works without it. Cron times are UTC, to
-- match the midnight-UTC day boundary used elsewhere (daily_tasks reset).

-- reaction_received ---------------------------------------------------
create or replace function notify_reaction_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_reaction_received$
declare
  v_author_id uuid;
  v_reactor_name text;
begin
  select author_id into v_author_id from posts where id = new.post_id;
  if v_author_id is null or v_author_id = new.user_id then
    return new;
  end if;

  select first_name into v_reactor_name from profiles where id = new.user_id;
  perform create_notification(
    v_author_id,
    'reaction_received',
    'New reaction!',
    coalesce(v_reactor_name, 'Someone') || ' reacted to your post.',
    null
  );
  return new;
end;
$notify_reaction_received$;

create trigger trg_reactions_notify
  after insert on reactions
  for each row execute function notify_reaction_received();

-- comment_received ---------------------------------------------------
create or replace function notify_comment_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_comment_received$
declare
  v_author_id uuid;
  v_commenter_name text;
begin
  select author_id into v_author_id from posts where id = new.post_id;
  if v_author_id is null or v_author_id = new.author_id then
    return new;
  end if;

  select first_name into v_commenter_name from profiles where id = new.author_id;
  perform create_notification(
    v_author_id,
    'comment_received',
    'New comment!',
    coalesce(v_commenter_name, 'Someone') || ' commented on your post.',
    null
  );
  return new;
end;
$notify_comment_received$;

create trigger trg_comments_notify
  after insert on comments
  for each row execute function notify_comment_received();

-- achievement_earned ---------------------------------------------------
create or replace function notify_achievement_earned()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_achievement_earned$
declare
  v_name text;
begin
  select name into v_name from achievements where id = new.achievement_id;
  perform create_notification(
    new.user_id,
    'achievement_earned',
    'Achievement unlocked!',
    'You earned "' || coalesce(v_name, 'a badge') || '".',
    '/profile'
  );
  return new;
end;
$notify_achievement_earned$;

create trigger trg_user_achievements_notify
  after insert on user_achievements
  for each row execute function notify_achievement_earned();

-- level_up: extend the existing trigger function from 004 in place -----
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

    perform create_notification(
      new.id,
      'level_up',
      'Level Up!',
      'You reached Level ' || new.level || '!',
      '/profile'
    );
  end if;
  return new;
end;
$log_level_up$;

-- mentor_answered ---------------------------------------------------
create or replace function notify_mentor_answered()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_mentor_answered$
begin
  if new.answer_text is not null and old.answer_text is null then
    perform create_notification(
      new.asked_by,
      'mentor_answered',
      'Your question was answered!',
      'A mentor answered your question.',
      '/mentors'
    );
  end if;
  return new;
end;
$notify_mentor_answered$;

create trigger trg_mentor_questions_notify
  after update on mentor_questions
  for each row execute function notify_mentor_answered();

-- new_opportunity: only notify members who've unlocked the board -----
create or replace function notify_new_opportunity()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_new_opportunity$
begin
  if new.is_active then
    insert into notifications (user_id, type, title, body, link)
    select id, 'new_opportunity', 'New Opportunity!', new.title, '/opportunities'
    from profiles
    where level >= 10;
  end if;
  return new;
end;
$notify_new_opportunity$;

create trigger trg_opportunities_notify
  after insert on opportunities
  for each row execute function notify_new_opportunity();

-- team_challenge_update -----------------------------------------------
create or replace function notify_team_challenge_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $notify_team_challenge_update$
begin
  insert into notifications (user_id, type, title, body, link)
  select id, 'team_challenge_update', 'Team Challenge Progress!', 'Your school''s challenge progress just updated.', '/teams'
  from profiles
  where school_id = new.school_id;
  return new;
end;
$notify_team_challenge_update$;

create trigger trg_team_challenge_progress_notify
  after insert or update on team_challenge_progress
  for each row execute function notify_team_challenge_update();

-- =========================================================================
-- SCHEDULED (pg_cron) — time-based reminders
-- =========================================================================

alter table events add column reminder_sent boolean not null default false;

create or replace function send_daily_tasks_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $send_daily_tasks_reminders$
begin
  insert into notifications (user_id, type, title, body, link)
  select p.id, 'daily_tasks_reminder', 'Daily tasks waiting!',
         'You haven''t completed any tasks today — jump back in for XP!', '/tasks'
  from profiles p
  where not exists (
    select 1 from daily_tasks dt
    where dt.user_id = p.id and dt.task_date = current_date and dt.is_completed = true
  );
end;
$send_daily_tasks_reminders$;

create or replace function send_streak_risk_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $send_streak_risk_reminders$
begin
  insert into notifications (user_id, type, title, body, link)
  select p.id, 'streak_at_risk', 'Your streak is at risk!',
         'Log in today to keep your ' || p.current_streak || '-day streak alive.', '/home'
  from profiles p
  where p.current_streak > 0
    and p.last_active_date = (current_date - interval '1 day')::date;
end;
$send_streak_risk_reminders$;

create or replace function send_event_starting_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $send_event_starting_reminders$
declare
  v_event record;
begin
  for v_event in
    select id, title from events
    where reminder_sent = false
      and starts_at between now() and now() + interval '30 minutes'
  loop
    insert into notifications (user_id, type, title, body, link)
    select ea.user_id, 'event_starting', 'Starting soon!', v_event.title || ' starts in 30 minutes.', '/tasks'
    from event_attendees ea
    where ea.event_id = v_event.id;

    update events set reminder_sent = true where id = v_event.id;
  end loop;
end;
$send_event_starting_reminders$;

create extension if not exists pg_cron;

select cron.schedule('linky101-daily-tasks-reminder', '0 18 * * *', 'select send_daily_tasks_reminders();');
select cron.schedule('linky101-streak-risk-reminder', '0 20 * * *', 'select send_streak_risk_reminders();');
select cron.schedule('linky101-event-starting-reminder', '*/15 * * * *', 'select send_event_starting_reminders();');
