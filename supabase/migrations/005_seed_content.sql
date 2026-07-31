-- Seed content so the Teams, Tasks/Spin, Quiz, and Profile pages have real
-- rows to render out of the box. Dates are relative to "now" so this stays
-- meaningful whenever the migration actually runs.

-- achievements ----------------------------------------------------------
insert into achievements (name, description, icon, xp_reward, category, requirement_type, requirement_value)
values
  ('First Steps', 'Complete onboarding', '👋', 10, 'starter', 'onboarding_completed', 1),
  ('First Post', 'Share your first post', '✍️', 15, 'community', 'posts_created', 1),
  ('First Win', 'Share a win with the community', '🏆', 15, 'community', 'wins_shared', 1),
  ('3-Day Streak', 'Show up 3 days in a row', '🔥', 20, 'streak', 'current_streak', 3),
  ('7-Day Streak', 'Show up 7 days in a row', '🔥', 30, 'streak', 'current_streak', 7),
  ('30-Day Streak', 'Show up 30 days in a row', '🔥', 100, 'streak', 'current_streak', 30),
  ('Rising Star', 'Reach Level 5', '⭐', 25, 'level', 'level', 5),
  ('Double Digits', 'Reach Level 10', '🌟', 50, 'level', 'level', 10),
  ('Quiz Whiz', 'Complete 5 quizzes', '🧠', 30, 'learning', 'quizzes_completed', 5),
  ('Helpful Hand', 'Leave 10 comments', '💬', 20, 'community', 'comments_created', 10),
  ('Popular', 'Get 25 reactions on your posts', '❤️', 30, 'community', 'reactions_received', 25),
  ('Networker', 'Follow 10 founders', '🤝', 20, 'community', 'follows_created', 10)
on conflict (name) do nothing;

-- quizzes -----------------------------------------------------------------
insert into quizzes (id, title, description, category, min_level, question_count, time_limit_seconds, xp_reward, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'Startup Basics 101',
  'Five quick questions on the fundamentals of getting a business idea off the ground.',
  'General',
  1,
  5,
  120,
  50,
  true
)
on conflict (id) do nothing;

insert into quiz_questions (quiz_id, question_text, options, explanation, order_index)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'What''s the first step in validating a business idea?',
    '[
      {"text": "Talk to potential customers", "is_correct": true},
      {"text": "Build the full product", "is_correct": false},
      {"text": "Register a company", "is_correct": false},
      {"text": "Hire employees", "is_correct": false}
    ]'::jsonb,
    'Talking to potential customers helps you validate demand before investing time and money.',
    0
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'What does "MVP" stand for in a startup context?',
    '[
      {"text": "Minimum Viable Product", "is_correct": true},
      {"text": "Most Valuable Player", "is_correct": false},
      {"text": "Maximum Value Proposition", "is_correct": false},
      {"text": "Managed Venture Plan", "is_correct": false}
    ]'::jsonb,
    'An MVP is the simplest version of your product that lets you test your idea with real users.',
    1
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Which of these is a good way to fund an early idea?',
    '[
      {"text": "Savings or a small grant", "is_correct": true},
      {"text": "A large bank loan on day one", "is_correct": false},
      {"text": "Ignoring costs entirely", "is_correct": false},
      {"text": "Waiting for investors to find you", "is_correct": false}
    ]'::jsonb,
    'Starting small with savings or grants keeps risk low while you''re still testing your idea.',
    2
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Why is a "pitch" important for a founder?',
    '[
      {"text": "It clearly explains your idea to others", "is_correct": true},
      {"text": "It''s only needed for big companies", "is_correct": false},
      {"text": "It replaces the need for a product", "is_correct": false},
      {"text": "It''s just for competitions", "is_correct": false}
    ]'::jsonb,
    'A clear pitch helps you explain your idea to customers, mentors, and potential supporters.',
    3
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'What''s a healthy way to respond to negative feedback on your idea?',
    '[
      {"text": "Listen and look for useful insights", "is_correct": true},
      {"text": "Ignore it completely", "is_correct": false},
      {"text": "Give up immediately", "is_correct": false},
      {"text": "Argue with everyone who disagrees", "is_correct": false}
    ]'::jsonb,
    'Feedback — even negative — often contains useful signals you can use to improve.',
    4
  )
on conflict do nothing;

-- events ------------------------------------------------------------------
insert into events (title, description, event_type, starts_at, ends_at, is_premium_only, max_attendees, xp_reward)
values
  (
    'Pitch Like a Pro: Masterclass',
    'Learn how to structure a 60-second pitch that actually lands.',
    'masterclass',
    now() + interval '3 days',
    now() + interval '3 days 1 hour',
    false,
    100,
    30
  ),
  (
    'Live Q&A: Ask a Founder Anything',
    'Drop your questions for a live founder Q&A happening right now.',
    'q_and_a',
    now() - interval '1 hour',
    now() + interval '2 hours',
    false,
    200,
    20
  ),
  (
    'Branding Basics Workshop',
    'A hands-on workshop on naming, logos, and first impressions.',
    'workshop',
    now() - interval '3 days',
    now() - interval '2 days',
    false,
    50,
    25
  );

-- team_challenges -----------------------------------------------------------
insert into team_challenges (title, description, challenge_type, starts_at, ends_at, xp_reward_per_member, goal_value)
values (
  'Weekly Hustle Challenge',
  'Rack up team XP this week — every post, quiz, and streak counts.',
  'team_xp',
  now() - interval '1 day',
  now() + interval '6 days',
  40,
  1000
);
