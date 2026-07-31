-- Final systems migration: LinkCoins, podcasts, shop, mentor upgrades,
-- Linky AI, feedback, FAQ, plus the daily-task/spin/achievement RPC
-- updates that go with them.
--
-- This follows the spec's SQL closely, with a few fixes for gaps that
-- would otherwise be real security/data-integrity holes, consistent with
-- every other migration in this project:
--   1. link_coins is a currency — added to the privileged-fields lock
--      (001/004) so it can only change via add_coins/spend_coins, not a
--      direct client UPDATE.
--   2. user_purchases' RLS, as specified ("FOR ALL USING user_id =
--      auth.uid()"), would let a user INSERT a purchase row directly —
--      i.e. take any shop item for free without ever spending coins.
--      Split into SELECT + UPDATE (for equip/unequip) by the owner; INSERT
--      only happens through the new purchase_item() RPC, which spends the
--      coins atomically first.
--   3. shop_items and faq_items were missing admin-manage policies needed
--      by the Shop/FAQ managers in the admin dashboard.
--   4. mentor_ratings needed the trigger the spec calls for (point 2 under
--      System 7) to actually keep mentors.rating_avg/rating_count in sync
--      — it wasn't in the provided SQL.
--   5. All SECURITY DEFINER functions get `set search_path = public`,
--      matching the rest of this schema (protects against search_path
--      hijacking).
--
-- generate_daily_tasks / complete_task / perform_spin are created as
-- given, for completeness and for any future Edge Function that can't
-- import the Next.js app's TypeScript logic — but the app itself keeps
-- using lib/tasks.ts / lib/spin.ts as the primary path, since those also
-- do interest-weighted task selection and achievement-checking that these
-- SQL versions don't. Both paths share the same underlying RPCs
-- (increment_xp, add_coins, apply_streak_result), so balances stay
-- consistent either way.

-- =========================================================================
-- LinkCoins
-- =========================================================================

alter table profiles add column if not exists link_coins integer default 0;

-- =========================================================================
-- Podcasts
-- =========================================================================

create table if not exists podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  episode_number integer,
  audio_url text not null,
  duration_seconds integer,
  cover_image_url text,
  category text default 'general',
  is_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists podcast_listens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  podcast_id uuid references podcasts(id) on delete cascade,
  listened_at timestamptz default now(),
  completed boolean default false,
  unique(user_id, podcast_id)
);

-- =========================================================================
-- LinkCoin Shop
-- =========================================================================

create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  coin_cost integer not null,
  item_data jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists user_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  item_id uuid references shop_items(id) on delete cascade,
  purchased_at timestamptz default now(),
  is_equipped boolean default false,
  unique(user_id, item_id)
);

-- =========================================================================
-- Mentor upgrades
-- =========================================================================

alter table mentors add column if not exists avatar_url text;
alter table mentors add column if not exists rating_avg numeric(3,2) default 0;
alter table mentors add column if not exists rating_count integer default 0;

create table if not exists mentor_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  mentor_id uuid references mentors(id) on delete cascade,
  question_id uuid references mentor_questions(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

-- =========================================================================
-- Linky AI chat
-- =========================================================================

create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- Contact / Feedback
-- =========================================================================

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category text not null,
  subject text not null,
  message text not null,
  status text default 'pending',
  admin_response text,
  created_at timestamptz default now()
);

-- =========================================================================
-- FAQ
-- =========================================================================

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'general',
  order_index integer default 0,
  is_published boolean default true
);

-- =========================================================================
-- RLS
-- =========================================================================

alter table podcasts enable row level security;
create policy "Anyone can read published podcasts" on podcasts for select using (is_published = true);
create policy "Admins can manage podcasts" on podcasts for all using (is_admin()) with check (is_admin());

alter table podcast_listens enable row level security;
create policy "Users manage own listens" on podcast_listens for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table shop_items enable row level security;
create policy "Anyone can read active shop items" on shop_items for select using (is_active = true or is_admin());
create policy "Admins can manage shop items" on shop_items for all using (is_admin()) with check (is_admin());

alter table user_purchases enable row level security;
create policy "Users can view own purchases" on user_purchases for select using (user_id = auth.uid());
create policy "Users can equip/unequip own purchases" on user_purchases for update using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Deliberately no client INSERT policy — purchases are only created by
-- purchase_item(), which spends the coins first. See note at top of file.

alter table mentor_ratings enable row level security;
create policy "Users manage own ratings" on mentor_ratings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Anyone can read ratings" on mentor_ratings for select using (true);

alter table ai_chats enable row level security;
create policy "Users manage own chats" on ai_chats for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table feedback enable row level security;
create policy "Users insert own feedback" on feedback for insert with check (user_id = auth.uid());
create policy "Users read own feedback" on feedback for select using (user_id = auth.uid());
create policy "Admins manage all feedback" on feedback for all using (is_admin()) with check (is_admin());

alter table faq_items enable row level security;
create policy "Anyone can read published FAQs" on faq_items for select using (is_published = true or is_admin());
create policy "Admins can manage FAQs" on faq_items for all using (is_admin()) with check (is_admin());

-- =========================================================================
-- Privileged-field lock: add link_coins
-- =========================================================================

create or replace function prevent_privileged_profile_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent_privileged_profile_field_update$
begin
  if not is_admin()
     and coalesce(current_setting('linky101.bypass_profile_lock', true), 'false') <> 'true'
  then
    if new.is_admin is distinct from old.is_admin
      or new.is_premium is distinct from old.is_premium
      or new.premium_until is distinct from old.premium_until
      or new.xp is distinct from old.xp
      or new.level is distinct from old.level
      or new.current_streak is distinct from old.current_streak
      or new.longest_streak is distinct from old.longest_streak
      or new.profile_flair is distinct from old.profile_flair
      or new.link_coins is distinct from old.link_coins
    then
      raise exception 'Cannot modify privileged profile fields directly';
    end if;
  end if;
  return new;
end;
$prevent_privileged_profile_field_update$;

-- =========================================================================
-- LinkCoin functions
-- =========================================================================

create or replace function add_coins(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $add_coins$
declare
  new_total integer;
begin
  perform set_config('linky101.bypass_profile_lock', 'true', true);
  update profiles
  set link_coins = greatest(0, link_coins + p_amount)
  where id = p_user_id
  returning link_coins into new_total;
  return new_total;
end;
$add_coins$;

create or replace function spend_coins(p_user_id uuid, p_amount integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $spend_coins$
declare
  current_coins integer;
begin
  select link_coins into current_coins from profiles where id = p_user_id;
  if current_coins >= p_amount then
    perform set_config('linky101.bypass_profile_lock', 'true', true);
    update profiles set link_coins = link_coins - p_amount where id = p_user_id;
    return true;
  end if;
  return false;
end;
$spend_coins$;

-- Atomically spends coins and records the purchase — the only way
-- user_purchases gets a new row for a non-admin caller (see RLS note above).
create or replace function purchase_item(p_user_id uuid, p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $purchase_item$
declare
  v_cost integer;
  v_active boolean;
  v_already_owned boolean;
  v_spent boolean;
begin
  select coin_cost, is_active into v_cost, v_active from shop_items where id = p_item_id;
  if v_cost is null then
    return jsonb_build_object('success', false, 'error', 'Item not found');
  end if;
  if not v_active then
    return jsonb_build_object('success', false, 'error', 'Item is no longer available');
  end if;

  select exists(
    select 1 from user_purchases where user_id = p_user_id and item_id = p_item_id
  ) into v_already_owned;
  if v_already_owned then
    return jsonb_build_object('success', false, 'error', 'You already own this item');
  end if;

  v_spent := spend_coins(p_user_id, v_cost);
  if not v_spent then
    return jsonb_build_object('success', false, 'error', 'Not enough coins');
  end if;

  insert into user_purchases (user_id, item_id) values (p_user_id, p_item_id);

  return jsonb_build_object('success', true);
end;
$purchase_item$;

-- Equips a purchased item, unequipping any other owned item in the same
-- shop category first (only one frame/name colour/banner/title/etc at a
-- time), and mirrors the active selection into profile_flair under a
-- "shop_<type>" key so the rest of the app can read it without a join.
create or replace function equip_shop_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $equip_shop_item$
declare
  v_category text;
  v_item_data jsonb;
  v_flair_key text;
begin
  if not exists (select 1 from user_purchases where user_id = auth.uid() and item_id = p_item_id) then
    raise exception 'You do not own this item';
  end if;

  select category, item_data into v_category, v_item_data from shop_items where id = p_item_id;

  update user_purchases up
  set is_equipped = false
  where up.user_id = auth.uid()
    and up.is_equipped = true
    and up.item_id in (select id from shop_items where category = v_category);

  update user_purchases set is_equipped = true where user_id = auth.uid() and item_id = p_item_id;

  v_flair_key := 'shop_' || (v_item_data->>'type');

  perform set_config('linky101.bypass_profile_lock', 'true', true);
  update profiles
  set profile_flair = profile_flair || jsonb_build_object(v_flair_key, v_item_data)
  where id = auth.uid();
end;
$equip_shop_item$;

create or replace function unequip_shop_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $unequip_shop_item$
declare
  v_item_data jsonb;
  v_flair_key text;
begin
  if not exists (select 1 from user_purchases where user_id = auth.uid() and item_id = p_item_id) then
    raise exception 'You do not own this item';
  end if;

  select item_data into v_item_data from shop_items where id = p_item_id;
  v_flair_key := 'shop_' || (v_item_data->>'type');

  update user_purchases set is_equipped = false where user_id = auth.uid() and item_id = p_item_id;

  perform set_config('linky101.bypass_profile_lock', 'true', true);
  update profiles set profile_flair = profile_flair - v_flair_key where id = auth.uid();
end;
$unequip_shop_item$;

-- =========================================================================
-- Mentor rating trigger (System 7, point 2)
-- =========================================================================

create or replace function update_mentor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $update_mentor_rating$
begin
  update mentors
  set rating_count = (select count(*) from mentor_ratings where mentor_id = new.mentor_id),
      rating_avg = (select round(avg(rating)::numeric, 2) from mentor_ratings where mentor_id = new.mentor_id)
  where id = new.mentor_id;
  return new;
end;
$update_mentor_rating$;

create trigger trg_mentor_ratings_update
  after insert or update on mentor_ratings
  for each row execute function update_mentor_rating();

-- =========================================================================
-- Achievements now also award coins (+25 each, per System 2)
-- =========================================================================

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
  perform add_coins(p_user_id, 25);

  return true;
end;
$award_achievement$;

-- =========================================================================
-- Seed: shop items
-- =========================================================================

insert into shop_items (name, description, category, coin_cost, item_data) values
('Pink Glow Frame', 'Glowing pink border around your avatar', 'frames', 50, '{"type":"frame","color":"#ff6b9d","glow":true}'),
('Gold Frame', 'Shiny gold border around your avatar', 'frames', 100, '{"type":"frame","color":"#f5c518","glow":true}'),
('Rainbow Frame', 'Animated rainbow border', 'frames', 200, '{"type":"frame","color":"rainbow","animated":true}'),
('Sky Name', 'Your name appears in sky blue', 'name_colors', 100, '{"type":"name_color","color":"#38bdf8"}'),
('Purple Name', 'Your name appears in purple', 'name_colors', 100, '{"type":"name_color","color":"#a78bfa"}'),
('Gold Name', 'Your name appears in gold', 'name_colors', 150, '{"type":"name_color","color":"#f5c518"}'),
('Extra Reactions Pack', 'Unlock 💎🌟⚡🎯 reaction emojis', 'reactions', 75, '{"type":"reactions","emojis":["💎","🌟","⚡","🎯"]}'),
('Starter Banner', 'Custom pink gradient banner for your profile', 'banners', 150, '{"type":"banner","gradient":"pink"}'),
('Ocean Banner', 'Custom blue gradient banner for your profile', 'banners', 150, '{"type":"banner","gradient":"ocean"}'),
('Sunset Banner', 'Custom orange-pink gradient banner', 'banners', 200, '{"type":"banner","gradient":"sunset"}'),
('Hustler Title', '"Hustler" title badge under your name', 'titles', 200, '{"type":"title","text":"Hustler"}'),
('Visionary Title', '"Visionary" title badge under your name', 'titles', 200, '{"type":"title","text":"Visionary"}'),
('Creator Title', '"Creator" title badge under your name', 'titles', 200, '{"type":"title","text":"Creator"}'),
('Boss Title', '"Boss" title badge under your name', 'titles', 250, '{"type":"title","text":"Boss"}'),
('Streak Shield', 'Protects your streak if you miss a day — single use', 'consumables', 300, '{"type":"streak_shield","uses":1}'),
('Team Theme: Neon', 'Neon colour theme for your team page', 'team_themes', 500, '{"type":"team_theme","theme":"neon"}'),
('Team Theme: Galaxy', 'Galaxy colour theme for your team page', 'team_themes', 500, '{"type":"team_theme","theme":"galaxy"}')
on conflict do nothing;

-- =========================================================================
-- Seed: FAQ
-- =========================================================================

insert into faq_items (question, answer, category, order_index) values
('How do I level up?', 'Complete daily tasks, quizzes, and engage with the community to earn XP. Every bit of XP counts toward your next level!', 'getting_started', 1),
('What are LinkCoins?', 'LinkCoins are a currency you earn from daily tasks (5 per task), spins, achievements, and streaks. Spend them in the Shop on profile frames, name colours, titles, and more!', 'getting_started', 2),
('How do I earn my daily spin?', 'Complete at least 2 of your 5 daily tasks and the spin wheel unlocks. Premium members get 2 spins per day!', 'getting_started', 3),
('What happens if I miss a day?', 'Your streak resets to 0 unless you have a Streak Shield (from spins or the shop). Try to log in daily!', 'streaks', 4),
('How do I join a team?', 'Go to the Teams page and search for your school. If your school isn''t listed, you can request to add it!', 'teams', 5),
('What level do I need for mentors?', 'You need Level 15 to access the Mentor Q&A. Keep completing tasks and levelling up!', 'features', 6),
('What level do I need for opportunities?', 'The Opportunities Board unlocks at Level 10. You''ll find competitions, grants, work experience, and more.', 'features', 7),
('How do I listen to podcasts?', 'Go to the Learn page and tap the Podcasts tab. Podcasts unlock at Level 3!', 'features', 8),
('Is LinkY101 free?', 'Yes! The core experience is completely free. Premium (£3.99/month) adds extras like bonus spins, exclusive quizzes, premium flairs, and priority mentor access.', 'account', 9),
('How do I contact the team?', 'Go to your Profile → Settings → Help & Feedback to send us a message. We read everything!', 'account', 10),
('What is Linky AI?', 'Linky AI is your personal business assistant built into the app. Tap the pink chat bubble on any page to ask questions about business, the platform, or get help with your ideas!', 'features', 11),
('How do I get my podcast on LinkY101?', 'Currently only official LinkY101 podcasts are available. If you''re a creator and want to be featured, contact us through the feedback form!', 'features', 12)
on conflict do nothing;

-- =========================================================================
-- Seed: podcasts (placeholder audio — swap audio_url for real hosted
-- episodes before launch)
-- =========================================================================

insert into podcasts (title, description, episode_number, audio_url, duration_seconds, category, is_published) values
('Starting Your First Business at 15', 'Real talk on how to go from idea to first customer while still at school.', 1, 'https://example.com/podcasts/ep1.mp3', 720, 'starting_a_business', true),
('Building a Brand People Remember', 'What makes a logo, name, and vibe actually stick with your audience.', 2, 'https://example.com/podcasts/ep2.mp3', 660, 'marketing_branding', true),
('Your First £100: A Money Story', 'A founder walks through the exact steps that led to their first real income.', 3, 'https://example.com/podcasts/ep3.mp3', 540, 'money_finance', true),
('Leading a Team When You''re the Youngest', 'How to earn trust and lead confidently when you don''t have the most experience.', 4, 'https://example.com/podcasts/ep4.mp3', 600, 'leadership_teams', true),
('From Bedroom Startup to Local Business', 'A founder story about scaling from a side project to something real.', 5, 'https://example.com/podcasts/ep5.mp3', 780, 'founder_stories', true),
('Tech Tools Every Young Founder Needs', 'The apps, sites, and tools that make running a small business way easier.', 6, 'https://example.com/podcasts/ep6.mp3', 690, 'digital_tech', true)
on conflict do nothing;

-- =========================================================================
-- SQL versions of task/spin generation — for Edge Functions and future
-- use. The Next.js app's primary path is lib/tasks.ts / lib/spin.ts (see
-- note at top of file); both call the same increment_xp/add_coins/
-- apply_streak_result RPCs so balances stay consistent regardless of path.
-- =========================================================================

create or replace function generate_daily_tasks_sql(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $generate_daily_tasks_sql$
declare
  task_pool text[] := array[
    'read_and_react|Read & React|Read a lesson and leave a comment on it|15|5',
    'quiz_time|Quiz Time|Complete any quiz in Learn|15|5',
    'share_story|Share Your Story|Post in Community about your business idea or progress|15|5',
    'help_founder|Help a Founder|Reply to someone else''s Community post with advice|15|5',
    'explore_follow|Explore & Follow|Follow 2 new people you haven''t followed before|15|5',
    'team_spirit|Team Spirit|Complete a team challenge task or cheer a teammate|15|5',
    'dream_check|Dream Check|Update your dream or goal on your profile|15|5',
    'watch_learn|Watch & Learn|Listen to a podcast episode in Learn|15|5',
    'poll_power|Poll Power|Vote in a Community poll|15|5',
    'discovery_quest|Discovery Quest|Visit Discover and save an opportunity|15|5'
  ];
  selected text[];
  i integer;
  parts text[];
begin
  delete from daily_tasks where user_id = p_user_id and task_date = current_date;
  selected := (select array_agg(elem) from (select unnest(task_pool) as elem order by random() limit 5) sub);
  for i in 1..array_length(selected, 1) loop
    parts := string_to_array(selected[i], '|');
    insert into daily_tasks (user_id, task_type, description, xp_reward, task_date)
    values (p_user_id, parts[1], parts[3], parts[4]::integer, current_date);
  end loop;
end;
$generate_daily_tasks_sql$;

create or replace function complete_task_sql(p_task_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $complete_task_sql$
declare
  task_record daily_tasks%rowtype;
  tasks_done integer;
begin
  select * into task_record from daily_tasks where id = p_task_id and user_id = p_user_id;
  if task_record is null or task_record.is_completed then
    return '{"success":false}'::jsonb;
  end if;

  update daily_tasks set is_completed = true where id = p_task_id;
  perform increment_xp(p_user_id, task_record.xp_reward);
  perform add_coins(p_user_id, 5);

  select count(*) into tasks_done from daily_tasks
  where user_id = p_user_id and task_date = current_date and is_completed = true;

  if tasks_done = 2 then
    perform increment_xp(p_user_id, 15);
    perform add_coins(p_user_id, 10);
  elsif tasks_done = 4 then
    perform increment_xp(p_user_id, 30);
    perform add_coins(p_user_id, 20);
  elsif tasks_done = 5 then
    perform increment_xp(p_user_id, 50);
    perform add_coins(p_user_id, 50);
  end if;

  return jsonb_build_object(
    'success', true,
    'tasks_done', tasks_done,
    'tier', case when tasks_done >= 5 then 3 when tasks_done >= 4 then 2 when tasks_done >= 2 then 1 else 0 end
  );
end;
$complete_task_sql$;

create or replace function perform_spin_sql(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $perform_spin_sql$
declare
  tasks_done integer;
  spins_today integer;
  is_prem boolean;
  max_spins integer;
  roll numeric;
  prize_type text;
  prize_value jsonb;
begin
  select count(*) into tasks_done from daily_tasks
  where user_id = p_user_id and task_date = current_date and is_completed = true;
  if tasks_done < 2 then return '{"error":"Need 2+ tasks"}'::jsonb; end if;

  select is_premium into is_prem from profiles where id = p_user_id;
  max_spins := case when is_prem then 2 else 1 end;

  select count(*) into spins_today from daily_spins where user_id = p_user_id and spin_date = current_date;
  if spins_today >= max_spins then return '{"error":"No spins left"}'::jsonb; end if;

  roll := random();
  if roll < 0.25 then
    prize_type := 'xp_25'; prize_value := '{"xp":25,"coins":10,"label":"+25 XP + 10 Coins","rarity":"common"}';
    perform increment_xp(p_user_id, 25); perform add_coins(p_user_id, 10);
  elsif roll < 0.45 then
    prize_type := 'xp_50'; prize_value := '{"xp":50,"coins":20,"label":"+50 XP + 20 Coins","rarity":"uncommon"}';
    perform increment_xp(p_user_id, 50); perform add_coins(p_user_id, 20);
  elsif roll < 0.58 then
    prize_type := 'coins_50'; prize_value := '{"coins":50,"label":"50 LinkCoins!","rarity":"uncommon"}';
    perform add_coins(p_user_id, 50);
  elsif roll < 0.70 then
    prize_type := 'streak_shield'; prize_value := '{"label":"Streak Shield","rarity":"uncommon"}';
  elsif roll < 0.80 then
    prize_type := 'bonus_task'; prize_value := '{"label":"Bonus Task (2x XP)","rarity":"uncommon"}';
  elsif roll < 0.88 then
    prize_type := 'flair'; prize_value := '{"label":"Profile Flair","rarity":"rare"}';
  elsif roll < 0.93 then
    prize_type := 'team_boost'; prize_value := '{"xp":50,"label":"Team Boost +50 XP","rarity":"rare"}';
  elsif roll < 0.97 then
    prize_type := 'coins_200'; prize_value := '{"coins":200,"label":"200 LinkCoins!","rarity":"very_rare"}';
    perform add_coins(p_user_id, 200);
  elsif roll < 0.99 then
    prize_type := 'level_skip'; prize_value := '{"xp":100,"label":"Level Skip!","rarity":"very_rare"}';
    perform increment_xp(p_user_id, 100);
  else
    prize_type := 'mystery_box'; prize_value := '{"coins":500,"label":"MYSTERY BOX — 500 Coins!","rarity":"legendary"}';
    perform add_coins(p_user_id, 500);
  end if;

  insert into daily_spins (user_id, spin_date, spin_number, prize_type, prize_value)
  values (p_user_id, current_date, spins_today + 1, prize_type, prize_value);

  return prize_value;
end;
$perform_spin_sql$;

-- =========================================================================
-- Storage buckets for podcast audio/cover art and mentor photos
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('podcasts', 'podcasts', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mentor-photos', 'mentor-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view podcast files"
  on storage.objects for select
  using (bucket_id = 'podcasts');

create policy "Admins can manage podcast files"
  on storage.objects for all
  using (bucket_id = 'podcasts' and is_admin())
  with check (bucket_id = 'podcasts' and is_admin());

create policy "Anyone can view mentor photos"
  on storage.objects for select
  using (bucket_id = 'mentor-photos');

create policy "Mentors can upload their own photo"
  on storage.objects for insert
  with check (
    bucket_id = 'mentor-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Mentors can update their own photo"
  on storage.objects for update
  using (
    bucket_id = 'mentor-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
