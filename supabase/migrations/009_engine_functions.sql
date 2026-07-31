-- RPC functions backing the achievement engine, streak manager, and Stripe
-- webhook. All three touch privileged/admin-only fields (user_achievements
-- inserts, profiles.current_streak/longest_streak/profile_flair,
-- profiles.is_premium/premium_until), so — consistent with increment_xp,
-- apply_spin_prize, and bump_post_gold — each is a SECURITY DEFINER
-- function taking an explicit p_user_id rather than relying on auth.uid(),
-- so it can be called both from a user's own session (server actions) and
-- from trusted service-role contexts with no session at all (Edge
-- Functions, cron, Stripe webhooks).

-- profiles: track the Stripe identifiers needed to reconcile webhook events.
alter table profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text;

create unique index idx_profiles_stripe_customer_id on profiles (stripe_customer_id) where stripe_customer_id is not null;

-- Awards an achievement (idempotent) and its XP. Notification is handled by
-- the existing trg_user_achievements_notify trigger (007) — not duplicated
-- here.
create or replace function award_achievement(p_user_id uuid, p_achievement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $award_achievement$
declare
  v_xp_reward integer;
begin
  if exists (
    select 1 from user_achievements
    where user_id = p_user_id and achievement_id = p_achievement_id
  ) then
    return false;
  end if;

  select xp_reward into v_xp_reward from achievements where id = p_achievement_id;
  if v_xp_reward is null then
    return false;
  end if;

  insert into user_achievements (user_id, achievement_id) values (p_user_id, p_achievement_id);

  if v_xp_reward > 0 then
    perform increment_xp(p_user_id, v_xp_reward);
  end if;

  return true;
end;
$award_achievement$;

-- Applies a computed streak result. p_shield_delta / p_flair_delta may be
-- negative (consume) or positive (grant); current_streak can go down
-- (reset) but longest_streak only ever ratchets up. p_last_active_date is
-- NULL to leave last_active_date untouched (e.g. a pure streak reset), or
-- an explicit date — callers must pass a real date to advance it, since a
-- shield-bridged gap needs last_active_date moved to "yesterday" (not
-- today) so the user's next real check-in reads as a normal continuation
-- rather than another gap.
create or replace function apply_streak_result(
  p_user_id uuid,
  p_new_current_streak integer,
  p_shield_delta integer default 0,
  p_flair_delta integer default 0,
  p_last_active_date date default null
)
returns void
language plpgsql
security definer
set search_path = public
as $apply_streak_result$
begin
  perform set_config('linky101.bypass_profile_lock', 'true', true);

  update profiles
  set current_streak = p_new_current_streak,
      longest_streak = greatest(longest_streak, p_new_current_streak),
      last_active_date = coalesce(p_last_active_date, last_active_date),
      profile_flair = profile_flair
        || jsonb_build_object(
             'streak_shields',
             greatest(0, coalesce((profile_flair->>'streak_shields')::integer, 0) + p_shield_delta)
           )
        || jsonb_build_object(
             'flair_count',
             greatest(0, coalesce((profile_flair->>'flair_count')::integer, 0) + p_flair_delta)
           )
  where id = p_user_id;
end;
$apply_streak_result$;

-- Applies a Stripe subscription state change (webhook-driven). Bypasses the
-- profile lock the same way the functions above do.
create or replace function apply_premium_status(
  p_user_id uuid,
  p_is_premium boolean,
  p_premium_until timestamptz,
  p_stripe_customer_id text default null,
  p_stripe_subscription_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $apply_premium_status$
begin
  perform set_config('linky101.bypass_profile_lock', 'true', true);

  update profiles
  set is_premium = p_is_premium,
      premium_until = p_premium_until,
      stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = coalesce(p_stripe_subscription_id, stripe_subscription_id)
  where id = p_user_id;
end;
$apply_premium_status$;
