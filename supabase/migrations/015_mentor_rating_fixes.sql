-- Mentor rating integrity fixes (System 7: Mentor Upgrades).
--
-- The mentor_ratings table/RLS from 013 had two real gaps:
--   1. No unique(user_id, question_id) — a user could insert unlimited
--      ratings for the same question, skewing mentors.rating_avg.
--   2. RLS was "for all using (user_id = auth.uid())" with no WITH CHECK
--      tying the rating to a question that user actually asked and that
--      mentor actually answered — a user could rate any mentor freely.
--   3. mentors.rating_avg/rating_count were writable by the mentor
--      themselves via the existing "Mentors can update mentor profile"
--      policy (no privileged-field lock like profiles has), so a mentor
--      could self-rate to any average.

do $migration_check$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mentor_ratings_user_question_unique'
  ) then
    alter table mentor_ratings
      add constraint mentor_ratings_user_question_unique unique (user_id, question_id);
  end if;
end $migration_check$;

drop policy if exists "Users manage own ratings" on mentor_ratings;

create policy "Users can rate answered questions they asked"
  on mentor_ratings for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from mentor_questions mq
      where mq.id = question_id
        and mq.asked_by = auth.uid()
        and mq.answered_by = mentor_ratings.mentor_id
        and mq.answer_text is not null
    )
  );

-- mentor_ratings for select" from 013 already covers reads (using true).

-- mentors.rating_avg/rating_count privileged-field lock, mirroring
-- prevent_privileged_profile_field_update() for profiles.link_coins etc.
create or replace function prevent_privileged_mentor_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent_privileged_mentor_field_update$
begin
  if (new.rating_avg is distinct from old.rating_avg or new.rating_count is distinct from old.rating_count)
     and current_setting('linky101.bypass_mentor_lock', true) is distinct from 'true' then
    raise exception 'Cannot directly modify rating_avg/rating_count';
  end if;

  if new.is_verified is distinct from old.is_verified and not is_admin() then
    raise exception 'Only admins can change mentor verification status';
  end if;

  return new;
end;
$prevent_privileged_mentor_field_update$;

drop trigger if exists trg_prevent_privileged_mentor_update on mentors;
create trigger trg_prevent_privileged_mentor_update
  before update on mentors
  for each row execute function prevent_privileged_mentor_field_update();

create or replace function update_mentor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $update_mentor_rating$
begin
  perform set_config('linky101.bypass_mentor_lock', 'true', true);
  update mentors
  set rating_count = (select count(*) from mentor_ratings where mentor_id = new.mentor_id),
      rating_avg = (select round(avg(rating)::numeric, 2) from mentor_ratings where mentor_id = new.mentor_id)
  where id = new.mentor_id;
  return new;
end;
$update_mentor_rating$;
