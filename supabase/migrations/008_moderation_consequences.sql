-- Auto-escalates consequences when an admin actions a report: 3rd actioned
-- violation against a member => 24h posting restriction, 5th => 7-day
-- suspension. Runs as a trigger (not app code) so it applies consistently
-- no matter which admin tool updates reports.status.

create or replace function apply_moderation_consequence()
returns trigger
language plpgsql
security definer
set search_path = public
as $apply_moderation_consequence$
declare
  v_offender_id uuid;
  v_violation_count integer;
begin
  if new.status = 'actioned' and old.status is distinct from 'actioned' then
    if new.reported_type = 'post' then
      select author_id into v_offender_id from posts where id = new.reported_id;
    elsif new.reported_type = 'comment' then
      select author_id into v_offender_id from comments where id = new.reported_id;
    elsif new.reported_type = 'profile' then
      v_offender_id := new.reported_id;
    end if;

    if v_offender_id is not null then
      select count(*) into v_violation_count
      from reports r
      where r.status = 'actioned'
        and (
          (r.reported_type = 'profile' and r.reported_id = v_offender_id)
          or (r.reported_type = 'post' and r.reported_id in (select id from posts where author_id = v_offender_id))
          or (r.reported_type = 'comment' and r.reported_id in (select id from comments where author_id = v_offender_id))
        );

      if v_violation_count = 3 then
        insert into user_warnings (user_id, warning_type, reason, duration_hours, expires_at)
        values (v_offender_id, 'posting_restriction', 'Repeated content violations (3rd actioned report)', 24, now() + interval '24 hours');
        perform create_notification(
          v_offender_id, 'warning', 'Posting Restricted',
          'Your account has a 24-hour posting restriction due to repeated content violations.', null
        );
      elsif v_violation_count = 5 then
        insert into user_warnings (user_id, warning_type, reason, duration_hours, expires_at)
        values (v_offender_id, 'suspension', 'Repeated content violations (5th actioned report)', 168, now() + interval '7 days');
        perform create_notification(
          v_offender_id, 'warning', 'Account Suspended',
          'Your account has been suspended for 7 days due to repeated content violations.', null
        );
      end if;
    end if;
  end if;
  return new;
end;
$apply_moderation_consequence$;

create trigger trg_reports_apply_consequence
  after update on reports
  for each row execute function apply_moderation_consequence();
