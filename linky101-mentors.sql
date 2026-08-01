-- ============================================================
-- LinkY101 · Mentors
-- Paste the whole file into Supabase → SQL Editor → Run.
-- Safe to run more than once.
--
-- Adds the five verified mentors and the columns the app needs.
-- Photos live in the repo at public/mentors/, so they deploy with
-- the site — nothing to upload to Storage.
-- ============================================================

-- 1. Columns the current app reads but older databases may not have.
alter table mentors
  add column if not exists avatar_url text,
  add column if not exists headline text,
  add column if not exists location text,
  add column if not exists welcome_message text,
  add column if not exists rating_avg numeric default 0,
  add column if not exists rating_count integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists is_verified boolean default false,
  add column if not exists expertise text[] default '{}',
  add column if not exists created_at timestamptz default now();

-- 2. `mentors.id` originally had to match a row in auth.users, i.e. a mentor
--    could only exist if they'd signed up. These five are real, DBS-checked
--    adults who have agreed to be listed but have no account yet, and the
--    product only ever shows their profile publicly — questions go into a
--    moderated queue, there is no private channel to them. So the link to
--    auth.users is dropped and their id is just an identifier.
alter table mentors drop constraint if exists mentors_id_fkey;

-- 3. Anyone signed in can see mentors. Deliberately not anon: this is a
--    platform for under-18s and named adults' profiles are not public web.
alter table mentors enable row level security;
drop policy if exists "Members can read mentors" on mentors;
create policy "Members can read mentors" on mentors for select to authenticated
  using (is_active = true);

-- 4. The five mentors. Fixed ids so re-running updates rather than duplicates.
insert into mentors (id, display_name, headline, location, bio, expertise, avatar_url, welcome_message, is_verified, is_active)
values
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Helena Yeadon',
    'Teacher · Harbour Learning Trust',
    'Grimsby, England',
    E'I have been a teacher for over 20 years at Harbour Learning Trust, and I have taught hundreds of students who had no idea what they wanted to do — and that is completely normal.\n\nI work with entrepreneurship and AI, helping young people understand how to actually use these tools to build something of their own rather than just talk about them.\n\nI am here because I know how hard it is to ask for help. No question is too small, and I promise I have heard sillier ones.',
    array['Starting a business at school','Using AI properly','Balancing school and a side hustle','Getting your first customers','Talking to adults confidently','What to do after school'],
    null,
    E'If you are reading this and feeling a bit nervous about asking — do not be. I have spent 20 years sitting with young people who thought their idea was silly or that they had left it too late. They had not. Ask me anything, honestly. No judgement, no marking, no right answers.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Mark Webb',
    'MD, E-Factor Group · The Business Hive',
    'Grimsby, North East Lincolnshire',
    E'I moved to London with £50 and a rucksack, built a career in newspapers, and now run the Business Hive in Grimsby helping hundreds of local entrepreneurs grow their businesses.\n\nI created E-Factor because I believe everyone deserves support when starting out. I have helped more businesses in North East Lincolnshire than I can count.\n\nI am here because I love helping young people figure out their next step. No question is too small. Just ask.',
    array['Starting a business','Finding customers','Confidence','Networking','Local opportunities','Growing your idea'],
    '/mentors/avatars/mark-webb.jpg',
    E'Hey! I have been where you are. Starting something new is scary but you do not have to figure it out alone. Drop me a question about anything business related and I will give you an honest answer. No judgement, just real advice.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Sophie Surfleet',
    'Business Consultant · E-Factor',
    'Cleethorpes, North East Lincolnshire',
    E'I am a business consultant at E-Factor and director of my own company. I have spent over 20 years helping businesses in Northern Lincolnshire grow, and I am a proud Grimbarian.\n\nI am known as a people connector. If you have got a vision or an idea, I will help you figure out how to make it happen and connect you with the right people.\n\nMy biggest belief is "want to grow your company, grow people." I am here to help you grow.',
    array['Starting a business','Making connections','Turning ideas into plans','Running a company','Local business support'],
    '/mentors/avatars/sophie-surfleet.jpg',
    E'I have been exactly where you are, full of ideas but not sure where to start. That is completely normal. Send me a question about anything business related and I will give you proper, honest advice. I am local, I am approachable, and I genuinely want to see you succeed.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Steve Hoey',
    'Careers Lead, Healing Academy',
    'North East Lincolnshire',
    E'I am Careers Lead at Healing Academy. My job is literally helping young people figure out their futures, and I love it.\n\nI am currently doing a PhD at the University of Hull researching why some young people get excluded from school, because I believe no one should be left behind.\n\nI am a dad, a coach, and just genuinely curious about people. If you have got a question about careers, I am all ears.',
    array['Careers & your future','Wellbeing','Feeling stuck','Finding your path','Confidence building','What to do next'],
    '/mentors/avatars/steve-hoey.jpg',
    E'I spend every day working with young people just like you. I know it can feel overwhelming trying to figure out what comes next. You do not need to have a plan. You just need to start talking. Ask me anything to do with careers — there is no such thing as a silly question here.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Stephen Logan',
    'Principal, Healing Academy',
    'Healing, North East Lincolnshire',
    E'I am Principal at Healing Academy, which won the Tes Inclusive School of the Year award. I lead with our DANCE values: Delight, Ambition, Nurture, Community and Empower.\n\nI am passionate about careers education, inclusion and helping every young person find their own version of success. Careers is not just about jobs, it is about building confidence and purpose.\n\nI am here because I believe every young person deserves someone in their corner. Ask me anything, no question is too small.',
    array['Careers & next steps','Building confidence','Finding your purpose','Leadership','Inclusion & SEND','School life'],
    '/mentors/avatars/stephen-logan.jpg',
    E'I work with young people every single day and I know how hard it can be to figure out what you want from life. You do not need to have all the answers right now. If you have got a question about your future, your career, or just need someone to listen, I am here. No judgement, just honest support.',
    true, true
  )
on conflict (id) do update set
  display_name    = excluded.display_name,
  headline        = excluded.headline,
  location        = excluded.location,
  bio             = excluded.bio,
  expertise       = excluded.expertise,
  avatar_url      = excluded.avatar_url,
  welcome_message = excluded.welcome_message,
  is_verified     = excluded.is_verified,
  is_active       = excluded.is_active;

select display_name, headline, is_verified from mentors order by display_name;
