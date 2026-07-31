-- Lets Level 5+ members bump a community post to gold from the client,
-- without weakening the existing admin-only lock on moderation fields.
--
-- prevent_moderation_field_update() (see 001_initial_schema.sql) blocks any
-- non-admin from changing posts.is_gold. bump_post_gold() is the one
-- sanctioned bypass: it checks the caller's level itself, then flips the
-- transaction-local flag the trigger already knows how to honor.

create or replace function prevent_moderation_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent_moderation_field_update$
begin
  if not is_admin()
     and coalesce(current_setting('linky101.bypass_moderation_lock', true), 'false') <> 'true'
  then
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

create or replace function bump_post_gold(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $bump_post_gold$
declare
  v_level integer;
begin
  select level into v_level from profiles where id = auth.uid();

  if v_level is null or v_level < 5 then
    raise exception 'Reach Level 5 to bump posts to gold';
  end if;

  perform set_config('linky101.bypass_moderation_lock', 'true', true);

  update posts set is_gold = true where id = p_post_id and is_gold = false;
end;
$bump_post_gold$;
