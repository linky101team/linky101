-- ai_chats (013) has no unique constraint on user_id, but the Linky AI
-- route (app/api/linky-ai/route.ts) keeps one running conversation per user
-- via `upsert(..., { onConflict: "user_id" })` — that requires a real
-- unique constraint to target, otherwise Postgres has nothing to conflict on.

do $migration_check$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ai_chats_user_id_unique'
  ) then
    alter table ai_chats add constraint ai_chats_user_id_unique unique (user_id);
  end if;
end $migration_check$;
