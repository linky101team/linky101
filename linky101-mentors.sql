-- ============================================================
-- LinkY101 · Mentors (rebuilt from the profile cards)
-- Paste the whole file into Supabase -> SQL Editor -> Run.
-- Click once in the editor first so nothing is highlighted.
-- Safe to run more than once.
--
-- Names, roles, locations, bios, ask-me-about topics and welcome
-- messages are taken verbatim from the mentor profile cards.
-- ============================================================

-- Anyone who is no longer on a card comes off the site. Their row is
-- deactivated rather than deleted, so nothing that references them breaks.
update mentors set is_active = false;

insert into mentors (id, display_name, headline, location, bio, expertise, avatar_url, welcome_message, is_verified, is_active)
values
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Becky Benfield-Humberstone',
    'Business Coach & Mentor | Podcast Host | Author',
    'London, United Kingdom',
    E'🎧 I''m Becky, a multi-award-winning business coach with over 25 years of experience. I host the Quietly Disruptive Podcast and I''ve written a book about building businesses your own way.\\n\\n🤫 I believe you don''t have to be the loudest person in the room to change the world. The most powerful founders are the quiet, deliberate ones who do things differently. I call it being Quietly Disruptive.\\n\\n💬 If you''ve got an idea but you''re holding back because you don''t feel ready, loud enough or brave enough, I''m the person to talk to. You''re more ready than you think.',
    array['Starting a business','Being yourself','Confidence','Doing things differently','Overcoming self doubt','Finding your vision'],
    '/mentors/avatars/becky-benfield-humberstone.jpg',
    E'You know that feeling when you''ve got this big idea but a voice in your head says "who am I to do this?" I''ve heard that voice too. Every successful founder has. The difference is they did it anyway. You don''t need to be loud, you don''t need a perfect plan, and you definitely don''t need to be like anyone else. Your way is the right way. Let''s talk about it.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Helena Yeadon',
    'Teacher | Entrepreneurship & AI',
    'Grimsby, North East Lincolnshire',
    E'📚 I''m Helena Yeadon, a teacher with over 20 years of experience at Harbour Learning Trust. I''m passionate about entrepreneurship and AI, and I love helping young people discover what they''re capable of.\\n\\n💪 I''m big on resilience, building good habits, and staying positive even when things get tough. I believe small daily actions lead to massive results.\\n\\n💬 I''ve worked with teenagers my entire career. I get it. If you need advice, encouragement, or just someone who believes in you, I''m here.',
    array['Building good habits','Staying resilient','Entrepreneurship','AI & tech','Staying positive','High performance'],
    '/mentors/avatars/helena-yeadon.jpg',
    E'You don''t need to be perfect to start. You don''t need a big idea or a plan that''s all figured out. The people who win are the ones who show up every day, build small habits that stick, and refuse to quit when it gets hard. That''s not talent. That''s a choice. And you can make that choice right now.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Mark Webb',
    'MD, E-Factor Group | The Business Hive',
    'Grimsby, North East Lincolnshire',
    E'👋 I''m Mark. I moved to London with £50 and a rucksack, built a career in newspapers, and now run the Business Hive in Grimsby helping hundreds of local entrepreneurs grow their businesses.\\n\\n🐝 I created E-Factor because I believe everyone deserves support when starting out. I''ve helped more businesses in North East Lincolnshire than I can count.\\n\\n💬 I''m here because I love helping young people figure out their next step. No question is too small. Just ask.',
    array['Starting a business','Finding customers','Confidence','Networking','Local opportunities','Growing your idea'],
    '/mentors/avatars/mark-webb.jpg',
    E'Hey! I''ve been where you are. Starting something new is scary but you don''t have to figure it out alone. Drop me a question about anything business related and I''ll give you an honest answer. No judgement, just real advice.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Sophie Surfleet',
    'Business Consultant | E-Factor',
    'Cleethorpes, North East Lincolnshire',
    E'👋 I''m Sophie, a business consultant at E-Factor and director of my own company. I''ve spent over 20 years helping businesses in Northern Lincolnshire grow, and I''m a proud Grimbarian.\\n\\n🤝 I''m known as a people connector. If you''ve got a vision or an idea, I''ll help you figure out how to make it happen and connect you with the right people.\\n\\n💬 My biggest belief is "want to grow your company, grow people." I''m here to help you grow.',
    array['Starting a business','Making connections','Turning ideas into plans','Running a company','Local business support'],
    '/mentors/avatars/sophie-surfleet.jpg',
    E'I''ve been exactly where you are, full of ideas but not sure where to start. That''s completely normal. Send me a question about anything business related and I''ll give you proper, honest advice. I''m local, I''m approachable, and I genuinely want to see you succeed.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Stephen Logan',
    'Principal, Healing Academy',
    'Healing, North East Lincolnshire',
    E'🏫 I''m Stephen Logan, Principal at Healing Academy, winner of the Tes Inclusive School of the Year award. I lead with our DANCE values: Delight, Ambition, Nurture, Community and Empower.\\n\\n🏆 I believe high performance should be built into every teenager in all aspects of their life, not just exams. Confidence, resilience, purpose and self belief are just as important as grades.\\n\\n💬 Every young person has their own version of greatness. I''m here to help you find yours.',
    array['High performance','Building confidence','Careers & next steps','Finding your purpose','Resilience','Self belief'],
    '/mentors/avatars/stephen-logan.jpg',
    E'High performance isn''t just for athletes or CEOs. It''s for you. It''s about how you think, how you bounce back, how you show up every day. I''ve seen teenagers transform when they realise they already have everything they need inside them. You don''t need to be the smartest in the room. You just need to believe you belong there.',
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000006'::uuid,
    'Steve Hoey',
    'Careers Lead, Healing Academy',
    'North East Lincolnshire',
    E'🎯 I''m Steve Hoey, Careers Lead at Healing Academy. My job is literally helping young people figure out their futures, and I love it.\\n\\n🎓 I''m currently doing a PhD at the University of Hull researching why some young people get excluded from school, because I believe no one should be left behind.\\n\\n💬 I''m a dad, a coach, and just genuinely curious about people. If you''ve got a question about careers, I''m all ears.',
    array['Careers & your future','Wellbeing','Feeling stuck','Finding your path','Confidence building','What to do next'],
    '/mentors/avatars/steve-hoey.jpg',
    E'I spend every day working with young people just like you. I know it can feel overwhelming trying to figure out what comes next. You don''t need to have a plan. You just need to start talking. Ask me anything to do with careers, there''s no such thing as a silly question here.',
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

-- Keep the LinkY101 Team answerer available.
update mentors set is_active = true
where id = '00000000-0000-0000-0000-000000000099'::uuid;

select display_name, headline, is_active from mentors order by display_name;
