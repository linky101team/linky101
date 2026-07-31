-- Admin Dashboard (System 9) support: profiles only had a self-update RLS
-- policy, so admins had no way to toggle another user's is_premium/is_admin
-- from the Users manager. The existing privileged-field-lock trigger
-- already permits admin writes to those fields (`not is_admin()` check) —
-- this policy is the missing piece that lets an admin's UPDATE reach a
-- row that isn't their own in the first place.

create policy "Admins can update any profile"
  on profiles for update
  using (is_admin())
  with check (is_admin());

-- quiz_attempts only had a "view own" policy, so the Analytics page's
-- "Most Attempted Quizzes" query would've silently returned just the
-- admin's own attempts under RLS.
create policy "Admins can view all quiz attempts"
  on quiz_attempts for select
  using (is_admin());

-- Same gap on user_purchases — the Shop Manager's "X owned" counts need to
-- see every user's purchases, not just the admin's own.
create policy "Admins can view all purchases"
  on user_purchases for select
  using (is_admin());
