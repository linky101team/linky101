-- ============================================================
-- LinkY101 · Learn content
-- Paste the whole file into Supabase -> SQL Editor -> Run.
-- Click once in the editor first so nothing is highlighted, or the
-- editor only runs the highlighted part.
-- Safe to run more than once.
--
-- Creates the lesson tables, the XP/coin helpers they depend on, and
-- seeds every lesson in the curriculum.
-- ============================================================

-- ---------- helper functions ----------

create or replace function xp_to_level(p_xp integer)
returns integer
language sql
immutable
as $xp_to_level$
  select t.level
  from (
    values
      (1, 0), (2, 50), (3, 100), (4, 200), (5, 400),
      (6, 600), (7, 800), (8, 1000), (9, 1100), (10, 1200),
      (11, 1400), (12, 1600), (13, 1800), (14, 2100), (15, 2500),
      (16, 3000), (17, 3500), (18, 4000), (19, 4500), (20, 5000),
      (21, 6000), (22, 7000), (23, 8000), (24, 9000), (25, 10000),
      (26, 12000), (27, 14000), (28, 16000), (29, 18000), (30, 20000)
  ) as t(level, xp_required)
  where t.xp_required <= p_xp
  order by t.level desc
  limit 1;
$xp_to_level$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $is_admin$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$is_admin$;

create or replace function increment_xp(user_id uuid, amount integer)
returns table (new_xp integer, new_level integer, leveled_up boolean)
language plpgsql
security definer
set search_path = public
as $increment_xp$
declare
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
begin
  select p.level into v_old_level
  from profiles p
  where p.id = user_id;

  if not found then
    raise exception 'Profile % not found', user_id;
  end if;

  -- Local to this transaction; lets this function write xp/level through
  -- the trg_profiles_privileged_lock trigger without granting is_admin().
  perform set_config('linky101.bypass_profile_lock', 'true', true);

  update profiles
  set xp = xp + amount
  where id = user_id
  returning xp into v_new_xp;

  v_new_level := xp_to_level(v_new_xp);

  if v_new_level is distinct from v_old_level then
    update profiles
    set level = v_new_level
    where id = user_id;
  end if;

  return query select v_new_xp, v_new_level, (v_new_level > v_old_level);
end;
$increment_xp$;

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


-- ---------- lesson tables ----------

-- Structured "Lessons" curriculum (Duolingo-style skill path) — distinct
-- from the older community-submitted `posts` (template_type = 'lesson'),
-- which is why these tables are prefixed `curriculum_` rather than reusing
-- `lessons`/`lesson_progress` naming.

create table if not exists curriculum_lessons (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  order_index integer not null,
  title text not null,
  emoji text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  xp_reward integer not null default 20,
  coin_reward integer not null default 5,
  created_at timestamptz default now(),
  unique (category, order_index)
);

create table if not exists curriculum_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references curriculum_lessons(id) on delete cascade,
  completed boolean not null default false,
  quiz_score integer,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create index if not exists idx_curriculum_progress_user on curriculum_progress (user_id);

alter table curriculum_lessons enable row level security;
drop policy if exists "Anyone can read lessons" on curriculum_lessons;
create policy "Anyone can read lessons" on curriculum_lessons for select using (true);
drop policy if exists "Admins can manage lessons" on curriculum_lessons;
create policy "Admins can manage lessons" on curriculum_lessons for all using (is_admin()) with check (is_admin());

alter table curriculum_progress enable row level security;
drop policy if exists "Users can view own lesson progress" on curriculum_progress;
create policy "Users can view own lesson progress" on curriculum_progress for select using (user_id = auth.uid());
-- No client insert/update policy — writes only happen through
-- complete_curriculum_lesson(), which awards XP/coins atomically on the
-- first completion (mirrors purchase_item()'s pattern for the same reason:
-- a direct client insert could mark a lesson "complete" without actually
-- taking the quiz, and could be replayed for free XP).

create or replace function complete_curriculum_lesson(p_user_id uuid, p_lesson_id uuid, p_quiz_score integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $complete_curriculum_lesson$
declare
  v_xp integer;
  v_coins integer;
  v_already boolean;
  v_new_xp integer;
  v_new_level integer;
  v_leveled_up boolean;
begin
  select xp_reward, coin_reward into v_xp, v_coins from curriculum_lessons where id = p_lesson_id;
  if v_xp is null then
    return jsonb_build_object('success', false, 'error', 'Lesson not found');
  end if;

  select exists(
    select 1 from curriculum_progress where user_id = p_user_id and lesson_id = p_lesson_id and completed = true
  ) into v_already;

  insert into curriculum_progress (user_id, lesson_id, completed, quiz_score, completed_at)
  values (p_user_id, p_lesson_id, true, p_quiz_score, now())
  on conflict (user_id, lesson_id)
  do update set completed = true, quiz_score = excluded.quiz_score, completed_at = now();

  if v_already then
    return jsonb_build_object('success', true, 'firstCompletion', false, 'xpEarned', 0, 'coinsEarned', 0);
  end if;

  select new_xp, new_level, leveled_up into v_new_xp, v_new_level, v_leveled_up
  from increment_xp(p_user_id, v_xp);
  perform add_coins(p_user_id, v_coins);

  return jsonb_build_object(
    'success', true,
    'firstCompletion', true,
    'xpEarned', v_xp,
    'coinsEarned', v_coins,
    'leveledUp', coalesce(v_leveled_up, false),
    'newLevel', v_new_level
  );
end;
$complete_curriculum_lesson$;


-- ---------- lesson content ----------

-- Seeds the 7-category, 28-lesson curriculum. Lessons 1-8 (Business Basics
-- + Brand Building) have full-depth content per the spec; lessons 9-28 are
-- shorter but still original, real content — not placeholder text.

insert into curriculum_lessons (category, order_index, title, emoji, summary, content, xp_reward, coin_reward) values

-- =========================================================================
-- CATEGORY 1: BUSINESS BASICS (unlocks at Level 1)
-- =========================================================================

('business_basics', 1, 'What IS a Business?', '🏢',
 'Types of businesses, and how they actually make money.',
 '{
   "intro": "Strip away the jargon and a business is just one thing: someone solving a problem for someone else, and getting paid for it. That''s it. Your school''s vending machine, your favourite TikTok shop, a massive company like Nike — all doing the exact same basic thing.",
   "sections": [
     {"heading": "The three ways businesses make money", "body": "Almost every business does one (or more) of these: sells a PRODUCT (something physical or digital, like phone cases or an app), sells a SERVICE (doing something for someone, like tutoring or dog walking), or sells ACCESS (a subscription or membership, like Spotify). Once you know which one you''re doing, everything else gets easier."},
     {"heading": "Business types you''ll actually see", "body": "A sole trader is just one person running the show — most teen side hustles start here. A partnership is two or more people sharing the work and the profit. A limited company is a more formal setup adults use once a business gets bigger, because it separates the business''s money and risk from the owner''s personal money."},
     {"heading": "Why \"getting paid\" matters more than \"having an idea\"", "body": "Loads of people have business ideas. Way fewer people actually get someone to hand over money for it. The moment someone pays you — even £2 for a friendship bracelet — you''ve technically started a business. Everything after that is just making it bigger and better."}
   ],
   "takeaways": [
     {"color": "yellow", "text": "A business = solving a problem + getting paid for it. Nothing more mystical than that."},
     {"color": "mint", "text": "You don''t need a company, a logo, or a website to start — you need one paying customer."}
   ],
   "quiz": [
     {"question": "What is a business, at its core?", "options": ["Solving a problem and getting paid for it", "Having a cool logo", "Owning a shop", "Having lots of followers"], "correct": 0, "explanation": "Everything else — branding, shops, followers — comes after the core idea of solving a problem for money."},
     {"question": "Which of these is a \"service\" business?", "options": ["Dog walking", "Selling phone cases", "A Spotify subscription", "Selling a mixtape"], "correct": 0, "explanation": "A service means doing something for someone, rather than selling a physical or digital product."},
     {"question": "What officially makes something a business?", "options": ["Someone pays you for it", "You have a business card", "You register a company", "You have a website"], "correct": 0, "explanation": "The moment money changes hands for something you provide, you''ve started a business — everything else is optional polish."}
   ]
 }'::jsonb, 20, 5),

('business_basics', 2, 'Finding Your Idea', '💡',
 'How to spot a problem worth solving.',
 '{
   "intro": "The biggest myth about starting a business is that you need a totally original, never-seen-before idea. You really don''t. You just need to notice a problem — ideally one you already understand — and build a simple way to fix it.",
   "sections": [
     {"heading": "Look at your own life first", "body": "What annoys you? What do you wish existed? What do you or your friends keep having to work around? If YOU feel the problem, chances are hundreds of other people your age feel it too. That''s your first customer research, done for free."},
     {"heading": "Copy + tweak is a totally valid strategy", "body": "You don''t have to invent something brand new. You can take something that already works — a type of product, a type of content, a type of service — and make it better for a specific group of people. A candle shop isn''t a new idea; a candle shop scented like your school''s canteen on pizza day is a specific, memorable twist."},
     {"heading": "Test it small before you go big", "body": "Before spending money or huge amounts of time, try the smallest possible version. Selling one custom item to one friend. Posting one piece of content to see if anyone reacts. If people respond, you''ve validated the idea for almost no cost."}
   ],
   "takeaways": [
     {"color": "coral", "text": "The best ideas usually come from problems YOU personally experience."},
     {"color": "yellow", "text": "Test small first — one sale beats one hundred hours of planning."}
   ],
   "quiz": [
     {"question": "Where do most good business ideas actually come from?", "options": ["Problems you personally notice or experience", "A random idea generator", "Copying a huge company exactly", "Waiting for inspiration"], "correct": 0, "explanation": "Ideas rooted in a real problem you understand are much easier to build and sell than abstract, made-up ones."},
     {"question": "Is it OK to base your idea on something that already exists?", "options": ["Yes, if you add your own twist for a specific audience", "No, it must be 100% original", "Only if it''s a service, not a product", "Only adults are allowed to do this"], "correct": 0, "explanation": "Most successful small businesses are an existing idea done better for a specific group of people."},
     {"question": "What should you do before investing lots of time or money into an idea?", "options": ["Test the smallest possible version first", "Immediately build the full product", "Keep the idea secret from everyone", "Register a company"], "correct": 0, "explanation": "A tiny test tells you fast and cheaply whether people actually want what you''re planning to build."}
   ]
 }'::jsonb, 20, 5),

('business_basics', 3, 'Who''s Your Customer?', '🎯',
 'Understanding your target audience.',
 '{
   "intro": "\"Everyone\" is not a customer. The moment you try to sell to absolutely everybody, your marketing gets vague and nobody feels like it''s FOR them. Picking a specific person to picture makes every decision after this easier.",
   "sections": [
     {"heading": "Build a simple customer picture", "body": "Instead of \"teenagers\", think: \"14-year-old who loves K-pop, has £5-10 of pocket money a week, and spends most of their time on TikTok and Discord.\" The more specific, the easier it is to know exactly what to make and where to sell it."},
     {"heading": "Ask, don''t assume", "body": "The fastest way to understand your customer is to actually talk to a few people who might buy from you. What do they already spend money on? What would make them say yes immediately? Real answers beat guesses every time."},
     {"heading": "One audience now, more later", "body": "You can always expand who you sell to once the first group is happy. Starting narrow isn''t a limitation — it''s how you get really good, word-of-mouth customers before trying to please everyone at once."}
   ],
   "takeaways": [
     {"color": "mint", "text": "A specific, narrow audience is easier to sell to than a vague, broad one."},
     {"color": "coral", "text": "Ask real people real questions — don''t just guess what they want."}
   ],
   "quiz": [
     {"question": "Why is \"everyone\" a bad target audience?", "options": ["Marketing becomes vague and nobody feels it''s made for them", "It''s technically impossible to sell to everyone", "Adults won''t buy from teenagers", "It costs too much money"], "correct": 0, "explanation": "When you try to appeal to everybody, your message loses the specific detail that makes people feel understood."},
     {"question": "What''s the fastest way to understand what your customers actually want?", "options": ["Ask real people directly", "Guess based on what you personally like", "Copy a competitor exactly", "Wait for sales data to come in"], "correct": 0, "explanation": "Direct conversations give you real, specific answers much faster than guessing."},
     {"question": "Should you worry about only appealing to a narrow audience at first?", "options": ["No — you can expand later once that group is happy", "Yes — you should always target everyone from day one", "Yes — narrow audiences never work", "No — but only if you''re an adult"], "correct": 0, "explanation": "Starting narrow helps you build a loyal base you can expand from later."}
   ]
 }'::jsonb, 20, 5),

('business_basics', 4, 'Your First Sale', '💷',
 'How to make your first £1.',
 '{
   "intro": "Your first sale matters way more than it sounds like it should. It''s proof — to you and to everyone watching — that this isn''t just an idea, it''s a real business. Here''s how to get there fast.",
   "sections": [
     {"heading": "Sell to people who already trust you", "body": "Friends, family, classmates, and people who already follow you online are your warmest possible customers. They don''t need convincing that YOU are trustworthy — they already know that. Start there before trying to reach total strangers."},
     {"heading": "Make it stupidly easy to say yes", "body": "Remove every bit of friction: a clear price, a simple way to pay, and a clear description of what they''re getting. Confusion kills sales far more often than price does."},
     {"heading": "Celebrate it — then learn from it", "body": "Your first sale is a milestone worth celebrating. But also treat it as data: what worked? Would that customer buy again? What would make the NEXT sale even easier? Each sale should make the next one simpler."}
   ],
   "takeaways": [
     {"color": "yellow", "text": "Your warmest audience (friends, family, followers) is the easiest place to get your first sale."},
     {"color": "mint", "text": "Remove friction: clear price, easy payment, clear description = more yeses."}
   ],
   "quiz": [
     {"question": "Who''s usually the easiest group to make your first sale to?", "options": ["People who already know and trust you", "Complete strangers online", "Big companies", "Investors"], "correct": 0, "explanation": "People who already trust you don''t need to be convinced you''re legitimate — that''s already done."},
     {"question": "What most often kills a potential sale?", "options": ["Confusion about price or what they''re getting", "The product being too good", "Too many customers at once", "Selling to friends"], "correct": 0, "explanation": "Confusion and friction stop people from buying far more often than price does."},
     {"question": "What should you do right after your first sale?", "options": ["Reflect on what worked so the next sale is easier", "Stop selling and rest", "Immediately double your prices", "Keep it a secret"], "correct": 0, "explanation": "Treating your first sale as a learning moment helps you improve quickly."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 2: BRAND BUILDING (unlocks at Level 2)
-- =========================================================================

('brand_building', 1, 'Choosing a Business Name', '🏷️',
 'Tips for a name people actually remember.',
 '{
   "intro": "A name isn''t just a label — it''s the first impression of your whole business. A good one is easy to say, easy to remember, and hints at what you actually do or how you make people feel.",
   "sections": [
     {"heading": "What makes a name work", "body": "Short beats long. Easy-to-spell beats clever-but-confusing. And a name that''s easy to say out loud spreads faster by word of mouth than one people have to think about."},
     {"heading": "Check before you commit", "body": "Before you fall in love with a name, check if the social media handles and a matching domain are available. Also do a quick search to make sure it doesn''t already belong to someone else — awkward (and sometimes a legal problem) if it does."},
     {"heading": "It can evolve", "body": "Your name doesn''t have to be perfect on day one. Loads of huge companies started with a slightly different name and changed it once they understood their brand better. Pick something good enough to start, and keep moving."}
   ],
   "takeaways": [
     {"color": "coral", "text": "Short, easy to say, and easy to spell beats \"clever but confusing\" every time."},
     {"color": "yellow", "text": "Check social handles are free before you commit to a name."}
   ],
   "quiz": [
     {"question": "What generally makes a business name effective?", "options": ["Short, easy to say and remember", "As long and descriptive as possible", "Using difficult, unusual spelling", "Matching a competitor''s name"], "correct": 0, "explanation": "Short, simple names travel faster by word of mouth."},
     {"question": "What should you check before committing to a name?", "options": ["Whether matching social handles are available", "Whether your parents like it", "Whether it rhymes", "Nothing — just go with it"], "correct": 0, "explanation": "Checking availability avoids a confusing rebrand (or legal issue) down the line."},
     {"question": "Does your business name need to be perfect from day one?", "options": ["No — it can evolve as your brand develops", "Yes — you can never change it later", "Yes — or the business will fail", "No — names don''t matter at all"], "correct": 0, "explanation": "Plenty of successful businesses refined or changed their name after starting."}
   ]
 }'::jsonb, 20, 5),

('brand_building', 2, 'Design Your Brand', '🎨',
 'Colours, logos, and visual identity.',
 '{
   "intro": "Your \"visual identity\" is everything people SEE before they read a single word — colours, fonts, and your logo. Get it consistent, and people start recognising you at a glance.",
   "sections": [
     {"heading": "Pick 2-3 colours, not ten", "body": "A tight colour palette (2-3 core colours) looks far more professional than using whatever colour feels right in the moment. Reuse the same colours everywhere — posts, packaging, your bio — so people start associating those colours with you."},
     {"heading": "Your logo doesn''t need to be fancy", "body": "A simple text-based logo in a clean font is completely fine to start. Loads of free tools (like Canva) let you make something clean without any design experience. Consistency matters more than complexity."},
     {"heading": "Use it everywhere, the same way", "body": "The real power of a visual identity is repetition. Same colours, same logo, same style of photos — every single time. That repetition is what builds recognition over weeks and months."}
   ],
   "takeaways": [
     {"color": "mint", "text": "Pick 2-3 colours and reuse them everywhere — consistency beats complexity."},
     {"color": "coral", "text": "A simple, clean logo is completely fine — you don''t need a professional designer to start."}
   ],
   "quiz": [
     {"question": "How many core colours should a beginner brand usually stick to?", "options": ["2-3", "As many as possible", "Exactly 1", "It doesn''t matter"], "correct": 0, "explanation": "A tight palette looks more professional and is easier to stay consistent with."},
     {"question": "Does your logo need to be professionally designed to start?", "options": ["No — a simple, clean logo is completely fine", "Yes — or people won''t take you seriously", "Yes — always hire a designer first", "No — logos aren''t important at all"], "correct": 0, "explanation": "Plenty of free tools let you build a clean logo without design experience."},
     {"question": "What builds the strongest brand recognition over time?", "options": ["Consistent use of the same colours and style everywhere", "Changing your look often to stay fresh", "Using as many colours as possible", "A very complicated logo"], "correct": 0, "explanation": "Repetition of the same visual identity is what makes a brand memorable."}
   ]
 }'::jsonb, 20, 5),

('brand_building', 3, 'Your Brand Story', '📖',
 'Why stories sell better than products.',
 '{
   "intro": "People don''t just buy products — they buy the story behind them. \"Why did you start this?\" is one of the most powerful questions in business, because the honest answer connects with people way more than a list of features ever will.",
   "sections": [
     {"heading": "Your \"why\" is your story", "body": "Why did YOU start this? Maybe you couldn''t find a product you wanted, or you noticed a gap, or you just love making something. That honest reason is more interesting than any sales pitch."},
     {"heading": "Share the journey, not just the finished product", "body": "Behind-the-scenes moments — the first attempt that didn''t work, the excitement of your first sale — make people feel like they''re part of your journey. That connection builds loyalty way faster than a polished, perfect-looking post."},
     {"heading": "Keep it honest", "body": "You don''t need to exaggerate or make things up. Being real about being young, learning as you go, and figuring things out is genuinely a strength — plenty of customers actively want to support young founders."}
   ],
   "takeaways": [
     {"color": "yellow", "text": "Your honest \"why\" is more powerful marketing than a perfect sales pitch."},
     {"color": "mint", "text": "Sharing the journey (including mistakes) builds more loyalty than only showing polished results."}
   ],
   "quiz": [
     {"question": "What tends to connect with customers more than a list of product features?", "options": ["The honest story of why you started", "A longer feature list", "A lower price", "A fancier font"], "correct": 0, "explanation": "People remember and connect with genuine stories far more than technical details."},
     {"question": "Should you share behind-the-scenes moments, even messy ones?", "options": ["Yes — it makes people feel part of the journey", "No — only ever show a perfect final product", "No — it looks unprofessional", "Yes — but only good moments"], "correct": 0, "explanation": "Real, honest moments (including setbacks) build stronger connection and trust."},
     {"question": "Is being a young founder something to hide?", "options": ["No — it''s honestly a strength many customers support", "Yes — always pretend to be older", "Yes — customers won''t trust you otherwise", "It doesn''t matter either way"], "correct": 0, "explanation": "Being open about being a young founder often builds more goodwill, not less."}
   ]
 }'::jsonb, 20, 5),

('brand_building', 4, 'Social Media Setup', '📱',
 'Setting up Instagram and TikTok for business.',
 '{
   "intro": "Social media is where most young founders find their first customers. Setting your profile up properly — before you even post — makes a huge difference to how seriously people take you.",
   "sections": [
     {"heading": "Get the basics right", "body": "A clear profile photo (your logo works well), a bio that says exactly what you offer and who it''s for, and a link to where people can actually buy or contact you. Someone should understand your business in 5 seconds of looking at your profile."},
     {"heading": "Pick the platform your audience is already on", "body": "You don''t need to be everywhere at once. Pick 1-2 platforms where your specific audience actually spends time, and focus your energy there rather than spreading thin across five different apps."},
     {"heading": "Post consistently, not perfectly", "body": "A simple post every few days beats one perfect post a month. Consistency is what social media algorithms — and human memory — reward the most."}
   ],
   "takeaways": [
     {"color": "coral", "text": "Your bio should let someone understand your business in 5 seconds."},
     {"color": "yellow", "text": "Pick 1-2 platforms your audience actually uses, rather than spreading across every app."}
   ],
   "quiz": [
     {"question": "What should someone understand within 5 seconds of viewing your profile?", "options": ["What you offer and who it''s for", "Your entire life story", "Every product you''ve ever made", "Your favourite colour"], "correct": 0, "explanation": "A clear, quick-to-understand bio converts curious visitors into followers and customers."},
     {"question": "Do you need to be active on every social platform at once?", "options": ["No — focus on 1-2 where your audience actually is", "Yes — always be on every platform", "No — social media doesn''t matter", "Yes — but only for adults"], "correct": 0, "explanation": "Focusing your energy on where your specific audience spends time is more effective than spreading thin."},
     {"question": "What matters more for growth: perfect posts or consistent posts?", "options": ["Consistent posts", "Perfect, rare posts", "Neither matters", "Posting only once"], "correct": 0, "explanation": "Regular posting builds momentum and is rewarded by most platform algorithms."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 3: MAKING MONEY (unlocks at Level 3)
-- =========================================================================

('making_money', 1, 'Pricing Your Product', '💰',
 'How to price things for profit.',
 '{
   "intro": "Pricing feels scary, but it comes down to one simple check: does the price cover what it cost you to make it, with enough left over to call it worth your time?",
   "sections": [
     {"heading": "Add up your real costs first", "body": "Materials, packaging, and your time all count. It''s easy to forget your own time is worth something — don''t price so low that you''re basically working for free."},
     {"heading": "Look at what similar things sell for", "body": "Check what comparable products or services charge. You don''t have to match them exactly, but it gives you a realistic range instead of guessing completely blind."},
     {"heading": "It''s OK to adjust later", "body": "Your first price doesn''t have to be your forever price. If something sells out instantly, you might be underpriced. If nobody bites, it might be the price — or it might be something else entirely worth testing."}
   ],
   "takeaways": [
     {"color": "mint", "text": "Cost + your time + a bit of profit = a fair starting price."},
     {"color": "yellow", "text": "You can always adjust your price later based on real results."}
   ],
   "quiz": [
     {"question": "What should you include when calculating your costs?", "options": ["Materials, packaging, and your own time", "Only materials", "Only what competitors charge", "Nothing — just guess"], "correct": 0, "explanation": "Forgetting to value your own time is one of the most common pricing mistakes."},
     {"question": "Why look at what similar products/services charge?", "options": ["It gives you a realistic pricing range", "So you can copy them exactly", "It''s required by law", "It guarantees profit"], "correct": 0, "explanation": "Comparable pricing helps you avoid guessing blind, without meaning you must match it exactly."},
     {"question": "Can you change your price after you''ve started selling?", "options": ["Yes — pricing can be adjusted based on results", "No — your first price is permanent", "Only if you ask permission", "No — that would be unfair"], "correct": 0, "explanation": "Pricing is something you refine over time as you learn more about demand."}
   ]
 }'::jsonb, 20, 5),

('making_money', 2, 'Selling Online', '🛒',
 'Etsy, Depop, and Shopify basics.',
 '{
   "intro": "You don''t need to build your own website to start selling online. Platforms like Etsy (handmade/craft items), Depop (fashion/resale), and Shopify (a full online shop) each make it easy to get set up fast.",
   "sections": [
     {"heading": "Pick the platform that fits what you sell", "body": "Handmade or creative items tend to do well on Etsy. Clothing and resale items suit Depop. If you want full control over your own branded shop, Shopify is built for that — though it takes a bit more setup."},
     {"heading": "Photos matter more than you think", "body": "On any of these platforms, good, clear photos in decent lighting are one of the biggest things that separates listings that sell from ones that don''t. You don''t need fancy equipment — natural light and a clean background go a long way."},
     {"heading": "Read the reviews you get, good and bad", "body": "Early reviews are gold. They tell you what''s working and what to fix. Respond politely to every one — it shows future customers you actually care."}
   ],
   "takeaways": [
     {"color": "coral", "text": "Good photos in natural light can make or break an online listing."},
     {"color": "mint", "text": "Pick the platform that matches what you''re actually selling."}
   ],
   "quiz": [
     {"question": "Which platform is generally best suited to handmade/craft items?", "options": ["Etsy", "Depop", "Neither", "It doesn''t matter"], "correct": 0, "explanation": "Etsy''s audience specifically shops for handmade and craft goods."},
     {"question": "What''s one of the biggest factors in whether an online listing sells?", "options": ["Photo quality", "The exact time of day you post", "The listing''s font", "Your follower count"], "correct": 0, "explanation": "Clear, well-lit photos massively affect buyer confidence and conversion."},
     {"question": "How should you handle early customer reviews?", "options": ["Read them for feedback and respond politely to all", "Ignore negative ones completely", "Delete anything critical", "Only respond to positive reviews"], "correct": 0, "explanation": "Responding thoughtfully to all reviews builds trust with future customers."}
   ]
 }'::jsonb, 20, 5),

('making_money', 3, 'Selling In Person', '🏪',
 'Markets, pop-ups, and school events.',
 '{
   "intro": "Selling face-to-face is a completely different skill from selling online — and it''s a brilliant way to get real, immediate feedback on your product.",
   "sections": [
     {"heading": "Find the right spot", "body": "School fairs, local markets, and community events are great low-pressure places to start. Check if you need permission or a table booking in advance — most events are happy to have young sellers, but it''s worth asking."},
     {"heading": "Make your table easy to shop", "body": "Clear pricing, a tidy display, and a friendly \"hello, feel free to look around\" go a long way. People decide whether to stop at a table within a couple of seconds."},
     {"heading": "Bring change and a simple way to take payment", "body": "Have cash for change ready, and if possible a simple card/contactless payment option — plenty of free apps let you accept card payments from a phone. Missing a sale because someone couldn''t pay is avoidable."}
   ],
   "takeaways": [
     {"color": "yellow", "text": "A clear, tidy table with visible prices gets more people to stop and shop."},
     {"color": "coral", "text": "Always have a backup payment option beyond just cash."}
   ],
   "quiz": [
     {"question": "What''s a good low-pressure place to start selling in person?", "options": ["School fairs or local markets", "A huge shopping centre immediately", "Only online", "A stranger''s front door"], "correct": 0, "explanation": "These events are welcoming to beginners and low-risk to try."},
     {"question": "Why does a tidy, clearly priced table matter?", "options": ["People decide whether to stop within seconds", "It''s required by event organisers", "It makes cleanup easier", "It doesn''t really matter"], "correct": 0, "explanation": "First impressions at a stall happen almost instantly."},
     {"question": "Why have more than one payment option?", "options": ["So you don''t lose a sale if someone can''t pay one way", "It''s required by law", "It looks more professional", "Cash is never accepted anymore"], "correct": 0, "explanation": "Flexibility in payment prevents avoidable lost sales."}
   ]
 }'::jsonb, 20, 5),

('making_money', 4, 'Getting Your First 10 Customers', '👥',
 'Building real momentum.',
 '{
   "intro": "One sale is proof of concept. Ten sales is momentum. Getting there is less about a clever trick and more about consistently doing a few simple things well.",
   "sections": [
     {"heading": "Start with your warm network", "body": "Friends, family, classmates, and your existing followers are still your fastest route here — ask them directly, don''t just wait for them to notice."},
     {"heading": "Make it easy to share", "body": "Happy customers are often willing to tell others — if you make it easy. A simple \"tag a friend who''d love this\" or offering a small referral perk can turn 1 customer into 2 or 3."},
     {"heading": "Follow up, don''t just post and hope", "body": "Checking in with people who showed interest but didn''t buy yet (politely, not pushy) often converts more sales than posting more content. A lot of \"no\" is actually \"not yet.\""}
   ],
   "takeaways": [
     {"color": "mint", "text": "Your first 10 customers usually come from people who already know you."},
     {"color": "yellow", "text": "A gentle follow-up converts more sales than most people expect."}
   ],
   "quiz": [
     {"question": "Where do most of your first 10 customers typically come from?", "options": ["Your existing warm network", "Complete strangers", "Paid advertising", "Investors"], "correct": 0, "explanation": "People who already know and trust you are the easiest early customers."},
     {"question": "What can turn one customer into several?", "options": ["Making it easy for them to share/refer friends", "Raising your prices", "Posting less often", "Hiding your product"], "correct": 0, "explanation": "Referrals are one of the most powerful (and free) growth tools."},
     {"question": "What often converts more sales than posting more content?", "options": ["A polite follow-up with interested people", "Ignoring interested customers", "Lowering quality", "Waiting silently"], "correct": 0, "explanation": "Many potential customers just need a gentle nudge, not more content."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 4: PITCH PERFECT (unlocks at Level 4)
-- =========================================================================

('pitch_perfect', 1, 'What is a Pitch?', '🎤',
 'Elevator pitches explained.',
 '{
   "intro": "A pitch is just a short, clear explanation of your idea — built to grab attention fast. The name \"elevator pitch\" comes from the idea that you should be able to explain it in the time of a short lift ride.",
   "sections": [
     {"heading": "The 3-part structure", "body": "A simple, effective pitch covers: the PROBLEM (what''s frustrating or missing), your SOLUTION (what you''re doing about it), and why YOU (why you''re the right person to build it). That''s genuinely enough for a strong 30-60 second pitch."},
     {"heading": "Keep it jargon-free", "body": "If your pitch needs a dictionary, it''s too complicated. The best pitches could be understood by someone with zero background in your industry."},
     {"heading": "Practice out loud, not just in your head", "body": "A pitch that sounds great in your head often comes out clunky the first time you say it aloud. Practising out loud — even to a mirror — smooths out the awkward bits before it matters."}
   ],
   "takeaways": [
     {"color": "coral", "text": "Problem + Solution + Why You = a solid, simple pitch structure."},
     {"color": "yellow", "text": "If a stranger can''t understand your pitch, simplify it further."}
   ],
   "quiz": [
     {"question": "What are the three core parts of a simple pitch?", "options": ["Problem, Solution, Why You", "Name, Logo, Price", "Intro, Middle, Joke", "Cost, Profit, Investors"], "correct": 0, "explanation": "This structure covers everything a listener needs to understand and care about your idea."},
     {"question": "Should a pitch use lots of technical jargon?", "options": ["No — it should be understandable by anyone", "Yes — it sounds more professional", "Only for investors", "Only if it''s a tech business"], "correct": 0, "explanation": "Clear, simple language is far more persuasive than jargon."},
     {"question": "Why practice your pitch out loud?", "options": ["It reveals awkward parts that don''t work when spoken", "It''s required before pitching", "It makes it longer", "It doesn''t help at all"], "correct": 0, "explanation": "Speaking it aloud catches problems that reading silently misses."}
   ]
 }'::jsonb, 20, 5),

('pitch_perfect', 2, 'Building a Pitch Deck', '📊',
 'Slide-by-slide guide.',
 '{
   "intro": "A pitch deck is just a short slideshow that backs up your spoken pitch with visuals. It doesn''t need to be fancy — it needs to be clear.",
   "sections": [
     {"heading": "The essential slides", "body": "At minimum: a title slide (name + one-line description), the problem, your solution, who your customer is, and what you''re asking for (funding, support, feedback — whatever the pitch is for)."},
     {"heading": "One idea per slide", "body": "Cramming too much text onto one slide loses your audience. Each slide should make ONE point, with the rest explained by you talking, not by dense paragraphs on screen."},
     {"heading": "Design simply, not fancily", "body": "Consistent fonts, your brand colours, and plenty of empty space look more professional than cramming in every possible effect. Simple and clear wins over flashy and cluttered."}
   ],
   "takeaways": [
     {"color": "mint", "text": "Each slide should make exactly one clear point."},
     {"color": "coral", "text": "Simple, consistent design beats flashy, cluttered slides."}
   ],
   "quiz": [
     {"question": "What should a pitch deck include at minimum?", "options": ["Title, problem, solution, customer, and the ask", "Just a logo", "50+ slides of detail", "Only financial data"], "correct": 0, "explanation": "These core elements give a complete, understandable picture of your idea."},
     {"question": "How many main ideas should each slide cover?", "options": ["One", "As many as fit", "At least five", "It doesn''t matter"], "correct": 0, "explanation": "One idea per slide keeps your audience focused and following along."},
     {"question": "What kind of design works best for a pitch deck?", "options": ["Simple and consistent", "As flashy as possible", "Completely blank slides", "Random fonts for variety"], "correct": 0, "explanation": "Clean, consistent design reads as more professional and easier to follow."}
   ]
 }'::jsonb, 20, 5),

('pitch_perfect', 3, 'Presenting with Confidence', '🎙️',
 'Public speaking tips.',
 '{
   "intro": "Nerves before presenting are completely normal — even for experienced founders. A few practical habits make a huge difference to how confident you come across.",
   "sections": [
     {"heading": "Slow down", "body": "Nervous speakers tend to rush. Speaking slightly slower than feels natural almost always sounds calmer and clearer to your audience, even if it feels strange to you."},
     {"heading": "Know your first line cold", "body": "The start is the hardest part. If you memorise just your opening line, you''ll get past the scariest moment smoothly, and the rest tends to flow more naturally after that."},
     {"heading": "Pause instead of saying \"um\"", "body": "A short silent pause while you think feels much more confident to a listener than filling every gap with \"um\" or \"like\". Silence is not a mistake — it''s completely normal."}
   ],
   "takeaways": [
     {"color": "yellow", "text": "Speaking a little slower than feels natural reads as more confident."},
     {"color": "mint", "text": "Memorise your opening line — the start is the hardest part."}
   ],
   "quiz": [
     {"question": "What do nervous speakers commonly do without realising?", "options": ["Speak too quickly", "Speak too slowly", "Pause too much", "Stand too still"], "correct": 0, "explanation": "Nerves often speed people up — consciously slowing down helps a lot."},
     {"question": "Why memorise your opening line specifically?", "options": ["The start is usually the hardest, scariest part", "It''s the only part that matters", "It makes the pitch shorter", "Audiences only remember the start"], "correct": 0, "explanation": "Getting past the opening smoothly builds confidence for the rest of the pitch."},
     {"question": "What''s a better alternative to saying \"um\"?", "options": ["A short silent pause", "Speaking faster", "Repeating the last word", "Avoiding eye contact"], "correct": 0, "explanation": "A brief pause feels more composed and confident than filler words."}
   ]
 }'::jsonb, 20, 5),

('pitch_perfect', 4, 'Pitching to Investors', '🤝',
 'What investors actually look for.',
 '{
   "intro": "Investors aren''t just judging your idea — they''re judging whether they believe YOU can actually make it happen. Understanding what they care about helps you pitch with more confidence.",
   "sections": [
     {"heading": "They want to see you understand the problem deeply", "body": "Investors pay close attention to how well you understand the problem you''re solving, not just how excited you are about the solution. Deep understanding signals you''ll adapt well when things don''t go to plan."},
     {"heading": "They''re backing you as much as the idea", "body": "Especially for early-stage ideas, investors are often betting on the founder''s drive and coachability as much as the business itself. Showing you can take feedback well is a genuine strength."},
     {"heading": "Be honest about risks", "body": "Pretending your idea has no weaknesses actually makes experienced investors trust you LESS. Acknowledging real risks — and showing you''ve thought about them — builds more credibility than a pitch that sounds too perfect."}
   ],
   "takeaways": [
     {"color": "coral", "text": "Investors back founders as much as ideas — show your drive and coachability."},
     {"color": "yellow", "text": "Being honest about risks builds more trust than pretending everything''s perfect."}
   ],
   "quiz": [
     {"question": "What do investors often pay close attention to beyond the idea itself?", "options": ["How well the founder understands the problem", "The founder''s age", "How many slides the deck has", "The colour scheme used"], "correct": 0, "explanation": "Deep problem understanding signals a founder who can adapt and solve real issues."},
     {"question": "Why might showing you can take feedback well matter to investors?", "options": ["It signals coachability, which investors value", "It doesn''t matter at all", "It makes the pitch shorter", "Investors only care about numbers"], "correct": 0, "explanation": "Especially early on, investors are partly betting on the founder''s ability to grow and adapt."},
     {"question": "Should you hide the weaknesses or risks in your idea?", "options": ["No — acknowledging risks builds more trust", "Yes — always appear flawless", "Yes — investors don''t want honesty", "It doesn''t matter either way"], "correct": 0, "explanation": "Experienced investors trust founders more when they''re upfront about real risks."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 5: MONEY MANAGEMENT (unlocks at Level 5)
-- =========================================================================

('money_management', 1, 'Tracking Your Money', '📒',
 'Simple bookkeeping that actually works.',
 '{
   "intro": "Bookkeeping sounds boring, but it''s really just writing down what money came in and what money went out. Do this from day one and you''ll always know exactly where you stand.",
   "sections": [
     {"heading": "Two columns is enough to start", "body": "Money IN (every sale) and money OUT (every cost). A simple spreadsheet or even a notes app works fine — you don''t need fancy software when you''re starting out."},
     {"heading": "Track it as it happens", "body": "Logging each transaction right away is far more reliable than trying to remember everything a month later. Make it a habit, not a chore you dread."}
   ],
   "quiz": [
     {"question": "What are the two basic things to track in simple bookkeeping?", "options": ["Money in and money out", "Followers and likes", "Time and effort", "Ideas and plans"], "correct": 0, "explanation": "These two numbers give you a clear, simple picture of your business''s money."},
     {"question": "When''s the best time to log a transaction?", "options": ["As soon as it happens", "At the end of the year", "Never — memory is enough", "Only for big transactions"], "correct": 0, "explanation": "Logging immediately avoids forgetting or misremembering details later."},
     {"question": "Do you need expensive software to start tracking money?", "options": ["No — a simple spreadsheet or notes app works fine", "Yes — always buy accounting software first", "Yes — it''s required by law", "No — tracking isn''t necessary at all"], "correct": 0, "explanation": "Simple tools are completely fine for a small, early-stage business."}
   ]
 }'::jsonb, 20, 5),

('money_management', 2, 'Profit vs Revenue', '⚖️',
 'Understanding the difference.',
 '{
   "intro": "These two words get mixed up constantly, but the difference matters a lot. Revenue is everything you sold. Profit is what''s actually left after every cost.",
   "sections": [
     {"heading": "Revenue is the headline number", "body": "If you sell 10 items at £5 each, your revenue is £50. Sounds great — but it doesn''t tell you if you actually made any money."},
     {"heading": "Profit is the real number", "body": "Subtract materials, packaging, and any other costs from that £50, and what''s left is your profit. That''s the number that actually tells you if the business makes sense."}
   ],
   "quiz": [
     {"question": "What is revenue?", "options": ["The total money brought in from sales", "Money left after costs", "A type of business loan", "Your total savings"], "correct": 0, "explanation": "Revenue is the full amount from sales, before any costs are subtracted."},
     {"question": "What is profit?", "options": ["What''s left after subtracting all costs from revenue", "The same thing as revenue", "Only your biggest sale", "The price of one item"], "correct": 0, "explanation": "Profit reflects what you actually keep, not just what came in."},
     {"question": "Why can high revenue still mean a struggling business?", "options": ["If costs are even higher, there''s little or no profit", "Revenue always equals profit", "High revenue is always bad", "It can''t — revenue guarantees success"], "correct": 0, "explanation": "Revenue alone doesn''t account for costs, which is why profit matters more."}
   ]
 }'::jsonb, 20, 5),

('money_management', 3, 'Saving & Reinvesting', '🌱',
 'Growing your business money.',
 '{
   "intro": "What you do with your first profits shapes how fast your business can grow. A simple split between saving, reinvesting, and paying yourself keeps things sustainable.",
   "sections": [
     {"heading": "Reinvest a portion into growth", "body": "Putting some profit back into more materials, better packaging, or a small amount of marketing helps your business grow instead of staying exactly the same size."},
     {"heading": "Keep a small safety buffer", "body": "Setting aside a portion as savings means an unexpected cost (or a slow month) doesn''t put you in a difficult spot."}
   ],
   "quiz": [
     {"question": "Why reinvest some profit back into the business?", "options": ["It helps the business grow rather than stay the same size", "It''s required by law", "It guarantees instant success", "It has no real effect"], "correct": 0, "explanation": "Reinvestment fuels growth — more stock, better tools, wider reach."},
     {"question": "Why keep a savings buffer?", "options": ["To handle unexpected costs or slow periods", "It''s not necessary for small businesses", "To avoid ever spending money", "Only adults need to do this"], "correct": 0, "explanation": "A buffer protects you from being caught out by surprises."},
     {"question": "Is it reasonable to pay yourself something from profits?", "options": ["Yes — balancing saving, reinvesting, and paying yourself is healthy", "No — all profit must be reinvested", "No — that would be unfair to the business", "Only if you''re an adult"], "correct": 0, "explanation": "A sustainable business balances growth, safety, and rewarding the person running it."}
   ]
 }'::jsonb, 20, 5),

('money_management', 4, 'Taxes for Teens', '🧾',
 'What you need to know (UK-focused).',
 '{
   "intro": "Tax can sound scary, but the basics are simple: in the UK, everyone has a tax-free Personal Allowance each year, and most teens running a small side hustle won''t owe anything until they earn well above it. Still, it''s smart to understand the basics early.",
   "sections": [
     {"heading": "Know the Personal Allowance exists", "body": "Every UK taxpayer has an amount they can earn each year before paying Income Tax. Small side-hustle income from hobbies rarely gets close to it, but it''s worth knowing this is how the system works."},
     {"heading": "Keep records regardless", "body": "Even if you''re unlikely to owe tax, keeping simple records of what you earned and spent (see the Tracking Your Money lesson!) means you''re prepared if your business grows, or if a parent/guardian needs to help you understand your situation."},
     {"heading": "Ask a trusted adult if it grows", "body": "If your side hustle starts earning serious, regular money, it''s worth talking to a parent, guardian, or looking at official UK government guidance together, since tax rules depend on your specific situation."}
   ],
   "quiz": [
     {"question": "What is the UK Personal Allowance?", "options": ["The amount you can earn tax-free each year", "A type of business loan", "A tax you pay on savings only", "A fee for registering a business"], "correct": 0, "explanation": "The Personal Allowance is the tax-free amount everyone gets before Income Tax applies."},
     {"question": "Should you keep records even if you probably won''t owe tax yet?", "options": ["Yes — it prepares you if the business grows", "No — records are pointless below the allowance", "No — only adults need records", "Yes — but only for expenses"], "correct": 0, "explanation": "Good record-keeping habits pay off as a business grows."},
     {"question": "What should you do if your side hustle starts earning serious money?", "options": ["Talk to a trusted adult or check official guidance", "Ignore it completely", "Stop the business immediately", "Hide the income"], "correct": 0, "explanation": "Getting proper guidance matters once real money is involved."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 6: GROW & SCALE (unlocks at Level 7)
-- =========================================================================

('grow_scale', 1, 'Hiring Help', '🙋',
 'When and how to get your first helper.',
 '{
   "intro": "There''s a point where a growing side hustle becomes too much for one person. Getting help — even informally, from a friend — can be exactly what''s needed to keep growing.",
   "sections": [
     {"heading": "Know when you''re ready", "body": "If you''re turning down orders, missing deadlines, or burning out trying to do everything, that''s usually a sign it''s time for help — even just a few hours a week from someone you trust."},
     {"heading": "Start with clear, simple tasks", "body": "Handing off one specific, well-defined task (like packaging orders) is much easier to manage than vaguely asking someone to \"help out\"."}
   ],
   "quiz": [
     {"question": "What''s a common sign it might be time to get help?", "options": ["Turning down orders or missing deadlines", "Having too few customers", "Making too much profit", "Nothing — you should always work alone"], "correct": 0, "explanation": "Struggling to keep up with demand is a classic signal you''ve outgrown solo work."},
     {"question": "What kind of task is easiest to hand off first?", "options": ["One clear, specific task", "Everything at once", "Nothing — keep full control always", "Only the most difficult tasks"], "correct": 0, "explanation": "Clear, specific responsibilities are much easier to delegate successfully."},
     {"question": "Does getting help have to mean a formal job?", "options": ["No — it can start informally with someone you trust", "Yes — it must always be a formal contract", "No — you should never involve anyone else", "Yes — only adults can help"], "correct": 0, "explanation": "Many young founders start with informal help from friends or family."}
   ]
 }'::jsonb, 20, 5),

('grow_scale', 2, 'Customer Service', '💬',
 'Keeping customers happy.',
 '{
   "intro": "Good customer service turns a one-time buyer into a repeat customer — and a repeat customer into someone who tells their friends about you for free.",
   "sections": [
     {"heading": "Respond quickly and kindly", "body": "A fast, friendly reply to a question or issue makes a huge impression, even if you don''t have an instant solution. \"I''ll sort this for you\" goes a long way."},
     {"heading": "Fix problems generously, not grudgingly", "body": "When something goes wrong, fixing it with a good attitude (rather than acting annoyed) is what people remember and talk about — often more than if nothing had gone wrong at all."}
   ],
   "quiz": [
     {"question": "What makes a strong first impression when a customer has an issue?", "options": ["A fast, friendly response", "Ignoring the message", "Waiting a week to reply", "Blaming the customer"], "correct": 0, "explanation": "Speed and friendliness reassure customers even before the issue is fully solved."},
     {"question": "How should problems be handled?", "options": ["Generously and with a good attitude", "Grudgingly, only if forced to", "By ignoring them", "By blaming the customer"], "correct": 0, "explanation": "A generous, positive response to problems often builds more loyalty than a flawless experience."},
     {"question": "Why does good customer service matter for growth?", "options": ["It turns customers into repeat buyers and referrers", "It has no effect on growth", "It only matters for big companies", "It costs too much to bother with"], "correct": 0, "explanation": "Happy customers are one of the most powerful (and free) growth engines."}
   ]
 }'::jsonb, 20, 5),

('grow_scale', 3, 'Marketing on a Budget', '📢',
 'Free and cheap marketing ideas.',
 '{
   "intro": "You don''t need a big budget to market well. Some of the most effective tactics for a young founder cost nothing but time and creativity.",
   "sections": [
     {"heading": "Free tactics that work", "body": "Consistent, useful social media posts, collaborating with other young founders, and simply asking happy customers to share your page all cost nothing but effort."},
     {"heading": "Spend small, test small", "body": "If you do have a small budget, test a tiny amount first rather than spending it all in one go. See what actually gets a response before committing more."}
   ],
   "quiz": [
     {"question": "Do you need a big budget to market effectively as a young founder?", "options": ["No — many effective tactics are free", "Yes — paid ads are the only option", "Yes — marketing always costs a lot", "No — marketing doesn''t matter"], "correct": 0, "explanation": "Consistency, collaboration, and word of mouth cost nothing but effort."},
     {"question": "What''s a smart approach if you do have a small marketing budget?", "options": ["Test a small amount first before spending more", "Spend it all immediately", "Save it forever and never use it", "Give it to a competitor"], "correct": 0, "explanation": "Small tests reveal what works before you commit a bigger amount."},
     {"question": "What''s an example of a free marketing tactic?", "options": ["Asking happy customers to share your page", "Buying a huge billboard", "Running expensive TV ads", "Hiring a marketing agency"], "correct": 0, "explanation": "Word-of-mouth referrals are free and often more trusted than ads."}
   ]
 }'::jsonb, 20, 5),

('grow_scale', 4, 'Partnerships & Collabs', '🤜🤛',
 'Working with other young entrepreneurs.',
 '{
   "intro": "Teaming up with another young founder can introduce you to a whole new audience — and often, it''s the most fun part of running a business.",
   "sections": [
     {"heading": "Look for a good audience match", "body": "The best collabs are with businesses that share your audience but aren''t direct competitors. A jewellery maker and a candle brand, for example, often share similar customers."},
     {"heading": "Keep it simple and clear", "body": "Agree upfront on what each person is contributing and what success looks like. A quick, honest conversation before starting avoids confusion later."}
   ],
   "quiz": [
     {"question": "What makes a good collaboration partner?", "options": ["A shared audience without being direct competitors", "Being your exact competitor", "Having zero audience overlap", "Only working with people much older than you"], "correct": 0, "explanation": "Shared but non-competing audiences means both businesses genuinely benefit."},
     {"question": "What should you agree on before starting a collab?", "options": ["What each person is contributing and what success looks like", "Nothing — just start and figure it out", "Only the colour scheme", "Who gets more followers"], "correct": 0, "explanation": "A clear, upfront agreement avoids confusion and disappointment later."},
     {"question": "What''s one benefit of collaborating with another young founder?", "options": ["Access to a new audience", "It''s always cheaper than marketing alone", "It removes all business risk", "It guarantees viral growth"], "correct": 0, "explanation": "Collabs are one of the most effective ways to reach new people authentically."}
   ]
 }'::jsonb, 20, 5),

-- =========================================================================
-- CATEGORY 7: ADVANCED (unlocks at Level 10)
-- =========================================================================

('advanced', 1, 'Building a Website', '🌐',
 'No-code tools for teens.',
 '{
   "intro": "You don''t need to know how to code to build a decent website today. No-code tools let you drag, drop, and customise a professional-looking site in an afternoon.",
   "sections": [
     {"heading": "Start with what you actually need", "body": "Most small businesses just need a homepage, a way to show products or services, and a way for people to contact or buy. Resist the urge to add every possible feature at once."},
     {"heading": "No-code tools are genuinely powerful now", "body": "Modern website builders offer templates, drag-and-drop editors, and built-in ways to accept payments — no coding knowledge required to get something professional live."}
   ],
   "quiz": [
     {"question": "Do you need to know how to code to build a website today?", "options": ["No — no-code tools make it accessible", "Yes — coding is required", "No — websites aren''t useful anymore", "Yes — but only for teenagers"], "correct": 0, "explanation": "Modern no-code builders make website creation accessible to everyone."},
     {"question": "What should a small business website focus on at first?", "options": ["The essentials: showing what you offer and how to buy/contact you", "Every possible feature at once", "Only a blog", "Nothing — websites aren''t necessary"], "correct": 0, "explanation": "Starting simple avoids overwhelm and gets you live faster."}
   ]
 }'::jsonb, 20, 5),

('advanced', 2, 'Email Marketing', '📧',
 'Building a mailing list.',
 '{
   "intro": "Unlike social media followers, an email list is something you actually own — no algorithm decides who sees your message. That makes it one of the most valuable things you can build.",
   "sections": [
     {"heading": "Give people a reason to sign up", "body": "A small discount, early access to new products, or exclusive content gives people a reason to hand over their email instead of just following on social media."},
     {"heading": "Don''t overdo it", "body": "Emailing too often annoys people into unsubscribing. A regular, predictable rhythm (like once every couple of weeks) with genuinely useful content works far better than frequent, low-value messages."}
   ],
   "quiz": [
     {"question": "Why is an email list valuable compared to social media followers?", "options": ["You own it — no algorithm controls who sees your message", "It''s always free to build", "It requires no effort", "It''s the same as followers"], "correct": 0, "explanation": "Email reaches your list directly, unlike social platforms that control visibility."},
     {"question": "What encourages people to actually sign up for a mailing list?", "options": ["A clear benefit, like a discount or early access", "Nothing — people sign up randomly", "Making the signup form very long", "Hiding what the list is about"], "correct": 0, "explanation": "A clear incentive makes the value of signing up obvious."},
     {"question": "What happens if you email your list too often with low-value content?", "options": ["People are more likely to unsubscribe", "Your list grows faster", "Nothing changes", "It''s always a good strategy"], "correct": 0, "explanation": "Over-emailing with little value is one of the fastest ways to lose subscribers."}
   ]
 }'::jsonb, 20, 5),

('advanced', 3, 'Analytics & Data', '📈',
 'Understanding what''s working.',
 '{
   "intro": "Analytics sounds technical, but it just means looking at real numbers to understand what''s actually working — instead of guessing.",
   "sections": [
     {"heading": "Focus on a few numbers that matter", "body": "You don''t need to track everything. A few key numbers — like which posts get the most engagement, or which products sell best — tell you most of what you need to know."},
     {"heading": "Let data guide decisions, not override instinct entirely", "body": "Numbers are a great guide, but they don''t capture everything (like why something worked). Use data alongside your own judgement, not instead of it."}
   ],
   "quiz": [
     {"question": "Do you need to track every possible metric?", "options": ["No — a few key numbers usually tell you the most", "Yes — track absolutely everything", "No — data doesn''t matter at all", "Yes — but only for large companies"], "correct": 0, "explanation": "Focusing on a handful of meaningful metrics avoids overwhelm and confusion."},
     {"question": "Should data completely replace your own judgement?", "options": ["No — use data alongside your judgement", "Yes — always follow numbers exactly", "No — ignore data entirely", "Yes — judgement doesn''t matter"], "correct": 0, "explanation": "Data is a powerful guide, but doesn''t capture everything about why something works."},
     {"question": "What''s an example of useful data to track?", "options": ["Which products sell best", "Your shoe size", "The weather", "Random numbers"], "correct": 0, "explanation": "Sales and engagement data directly inform what to focus on next."}
   ]
 }'::jsonb, 20, 5),

('advanced', 4, 'Scaling Your Business', '🚀',
 'From side hustle to real company.',
 '{
   "intro": "Scaling means growing your business without everything becoming twice as much work. It''s less about \"doing more\" and more about building smarter systems.",
   "sections": [
     {"heading": "Systems over hustle", "body": "Writing down how you do repeatable tasks (like fulfilling an order) means it can be done consistently — by you, or eventually by someone helping you — without reinventing the process every time."},
     {"heading": "Growth should feel sustainable", "body": "The healthiest scaling happens gradually, with your systems, money management, and support (help, tools) growing roughly in step with your sales — not sales racing far ahead of everything else."}
   ],
   "quiz": [
     {"question": "What does \"scaling\" a business really mean?", "options": ["Growing without everything becoming proportionally more work", "Simply working longer hours", "Only hiring more people", "Spending more on ads"], "correct": 0, "explanation": "True scaling relies on smarter systems, not just more raw effort."},
     {"question": "Why write down how repeatable tasks are done?", "options": ["So they can be done consistently, even by someone else eventually", "It''s required by law", "It makes the task take longer", "It has no real benefit"], "correct": 0, "explanation": "Documented processes make growth and delegation much easier."},
     {"question": "What does healthy, sustainable growth look like?", "options": ["Systems and support growing roughly alongside sales", "Sales growing far faster than everything else", "No growth at all", "Growth that happens overnight"], "correct": 0, "explanation": "Balanced growth avoids the business becoming overwhelming or chaotic."}
   ]
 }'::jsonb, 20, 5)

on conflict (category, order_index) do nothing;


select category, count(*) as lessons from curriculum_lessons group by category order by category;
