-- apply_spin_prize (004) relied on auth.uid() to find the target profile,
-- which only works when called from the acting user's own session. The
-- rest of the engine (increment_xp, apply_streak_result, award_achievement)
-- takes an explicit p_user_id instead, so lib/spin.ts can stay consistent
-- with that pattern. Signature changes need a drop-then-create, not
-- create-or-replace, since the parameter list itself is changing.

drop function if exists apply_spin_prize(text, integer);

create or replace function apply_spin_prize(p_user_id uuid, p_prize_type text, p_prize_amount integer)
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
    where id = p_user_id;

  elsif p_prize_type = 'profile_flair' then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles
    set profile_flair = profile_flair
      || jsonb_build_object(
           'flair_count',
           coalesce((profile_flair->>'flair_count')::integer, 0) + 1
         )
    where id = p_user_id;

  elsif p_prize_type = 'level_skip' then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles set level = least(30, level + 1) where id = p_user_id;

  elsif p_prize_type = 'team_boost' then
    select school_id into v_school_id from profiles where id = p_user_id;
    if v_school_id is not null then
      update schools set team_xp = team_xp + p_prize_amount where id = v_school_id;
    end if;
  end if;
end;
$apply_spin_prize$;
