-- Structured "Lessons" curriculum (Duolingo-style skill path) — distinct
-- from the older community-submitted `posts` (template_type = 'lesson'),
-- which is why these tables are prefixed `curriculum_` rather than reusing
-- `lessons`/`lesson_progress` naming.

create table if not exists curriculum_lessons (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  order_index integer not null,
  title text not null,
  emoji text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  xp_reward integer not null default 20,
  coin_reward integer not null default 5,
  created_at timestamptz default now(),
  unique (category, order_index)
);

create table if not exists curriculum_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references curriculum_lessons(id) on delete cascade,
  completed boolean not null default false,
  quiz_score integer,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create index if not exists idx_curriculum_progress_user on curriculum_progress (user_id);

alter table curriculum_lessons enable row level security;
create policy "Anyone can read lessons" on curriculum_lessons for select using (true);
create policy "Admins can manage lessons" on curriculum_lessons for all using (is_admin()) with check (is_admin());

alter table curriculum_progress enable row level security;
create policy "Users can view own lesson progress" on curriculum_progress for select using (user_id = auth.uid());
-- No client insert/update policy — writes only happen through
-- complete_curriculum_lesson(), which awards XP/coins atomically on the
-- first completion (mirrors purchase_item()'s pattern for the same reason:
-- a direct client insert could mark a lesson "complete" without actually
-- taking the quiz, and could be replayed for free XP).

create or replace function complete_curriculum_lesson(p_user_id uuid, p_lesson_id uuid, p_quiz_score integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $complete_curriculum_lesson$
declare
  v_xp integer;
  v_coins integer;
  v_already boolean;
  v_new_xp integer;
  v_new_level integer;
  v_leveled_up boolean;
begin
  select xp_reward, coin_reward into v_xp, v_coins from curriculum_lessons where id = p_lesson_id;
  if v_xp is null then
    return jsonb_build_object('success', false, 'error', 'Lesson not found');
  end if;

  select exists(
    select 1 from curriculum_progress where user_id = p_user_id and lesson_id = p_lesson_id and completed = true
  ) into v_already;

  insert into curriculum_progress (user_id, lesson_id, completed, quiz_score, completed_at)
  values (p_user_id, p_lesson_id, true, p_quiz_score, now())
  on conflict (user_id, lesson_id)
  do update set completed = true, quiz_score = excluded.quiz_score, completed_at = now();

  if v_already then
    return jsonb_build_object('success', true, 'firstCompletion', false, 'xpEarned', 0, 'coinsEarned', 0);
  end if;

  select new_xp, new_level, leveled_up into v_new_xp, v_new_level, v_leveled_up
  from increment_xp(p_user_id, v_xp);
  perform add_coins(p_user_id, v_coins);

  return jsonb_build_object(
    'success', true,
    'firstCompletion', true,
    'xpEarned', v_xp,
    'coinsEarned', v_coins,
    'leveledUp', coalesce(v_leveled_up, false),
    'newLevel', v_new_level
  );
end;
$complete_curriculum_lesson$;
