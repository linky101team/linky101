-- profile_flair is on the privileged-fields lock list (001) so users can't
-- write it directly — flair_count/streak_shields are earned, not
-- self-editable. This RPC punches a narrow, safe hole for the flair
-- customization page: it only ever touches the four "active_*" cosmetic
-- keys, and only ever targets the caller's own row (auth.uid()), so it
-- can't be used to grant unearned flair_count/streak_shields or to touch
-- anyone else's profile.

create or replace function set_active_flair(
  p_border text,
  p_color text,
  p_badge text,
  p_name_gradient text
)
returns void
language plpgsql
security definer
set search_path = public
as $set_active_flair$
begin
  perform set_config('linky101.bypass_profile_lock', 'true', true);

  update profiles
  set profile_flair = profile_flair || jsonb_build_object(
    'active_border', p_border,
    'active_color', p_color,
    'active_badge', p_badge,
    'active_name_gradient', p_name_gradient
  )
  where id = auth.uid();
end;
$set_active_flair$;
