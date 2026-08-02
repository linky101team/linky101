-- ============================================================
-- LinkY101 · Ask a mentor  (private questions + weekly feed)
-- Paste the whole file into Supabase -> SQL Editor -> Run.
-- Click once in the editor first so nothing is highlighted.
-- Safe to run more than once.
-- ============================================================

-- Questions are PRIVATE by default now. `is_public` no longer means "anyone
-- can read this" — it means "this answer has been chosen for the weekly feed,
-- with the asker's name stripped off". Two different ideas, so they get two
-- different columns rather than one overloaded one.
alter table mentor_questions
  add column if not exists is_published boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists topic text;

-- Existing rows were public under the old meaning; keep them visible.
update mentor_questions set is_published = true where is_public = true and answer_text is not null;

-- Everything new starts private.
alter table mentor_questions alter column is_public set default false;

-- ---------- who can read what ----------
alter table mentor_questions enable row level security;

-- You can always see your own questions, answered or not.
drop policy if exists "Members read public questions" on mentor_questions;
drop policy if exists "Members read own questions" on mentor_questions;
create policy "Members read own questions" on mentor_questions for select to authenticated
  using (asked_by = auth.uid());

-- Everyone signed in can read the answers chosen for the weekly feed. The
-- asker's identity is never joined in on that view, so it reads anonymously.
drop policy if exists "Members read published answers" on mentor_questions;
create policy "Members read published answers" on mentor_questions for select to authenticated
  using (is_published = true and answer_text is not null);

drop policy if exists "Members ask questions" on mentor_questions;
create policy "Members ask questions" on mentor_questions for insert to authenticated
  with check (asked_by = auth.uid());

-- ---------- how many you can ask ----------
-- A cap, checked in the database rather than only in the UI so it cannot be
-- got round. Two a week makes people ask their real question instead of
-- firing off six, and it keeps the queue small enough for five volunteers.
create or replace function questions_asked_this_week(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $questions_asked_this_week$
  select count(*)::integer
  from mentor_questions
  where asked_by = p_user_id
    and created_at > now() - interval '7 days';
$questions_asked_this_week$;

grant execute on function questions_asked_this_week(uuid) to authenticated;

select 'questions ready' as status, count(*) as existing_questions from mentor_questions;
