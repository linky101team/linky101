-- Expanded achievement catalog for the achievement engine (lib/achievements.ts).
-- requirement_type is free text (no enum in schema) — the values used here
-- are the exact keys computeUserStats() in lib/achievements.ts produces.
-- Some names below already exist from 005_seed_content.sql (First Post,
-- 7-Day Streak, 30-Day Streak); "on conflict do nothing" lets this file be
-- additive without erroring or duplicating those.

insert into achievements (name, description, icon, xp_reward, category, requirement_type, requirement_value)
values
  ('First Post', 'Share your first post', '✍️', 15, 'community', 'posts_created', 1),
  ('7-Day Streak', 'Show up 7 days in a row', '🔥', 30, 'streak', 'longest_streak', 7),
  ('14-Day Streak', 'Show up 14 days in a row', '🔥', 40, 'streak', 'longest_streak', 14),
  ('30-Day Streak', 'Show up 30 days in a row', '🔥', 100, 'streak', 'longest_streak', 30),
  ('50-Day Streak', 'Show up 50 days in a row', '🔥', 150, 'streak', 'longest_streak', 50),
  ('Quiz Starter', 'Complete your first quiz', '🧠', 10, 'learning', 'quizzes_completed', 1),
  ('Quiz Master', 'Complete 10 quizzes', '🧠', 40, 'learning', 'quizzes_completed', 10),
  ('Quiz Champion', 'Complete 25 quizzes', '🏆', 75, 'learning', 'quizzes_completed', 25),
  ('Dream Sharer', 'Add your dream to your profile', '💭', 10, 'profile', 'has_dream', 1),
  ('First Follow', 'Follow your first founder', '🤝', 5, 'community', 'following_count', 1),
  ('Popular Founder', 'Reach 50 followers', '⭐', 50, 'community', 'followers_count', 50),
  ('Influencer', 'Reach 100 followers', '🌟', 100, 'community', 'followers_count', 100),
  ('Helper', 'Answer 5 mentor questions', '🎓', 30, 'mentorship', 'mentor_answers', 5),
  ('Team Player', 'Take part in 3 team challenges', '🏫', 40, 'team', 'team_challenges_participated', 3),
  ('Level 5', 'Reach Level 5', '🎖️', 20, 'level', 'level', 5),
  ('Level 10', 'Reach Level 10', '🎖️', 30, 'level', 'level', 10),
  ('Level 15', 'Reach Level 15', '🎖️', 40, 'level', 'level', 15),
  ('Level 20', 'Reach Level 20', '🎖️', 60, 'level', 'level', 20),
  ('Level 25', 'Reach Level 25', '🎖️', 80, 'level', 'level', 25),
  ('Level 30', 'Reach Level 30', '🎖️', 120, 'level', 'level', 30),
  ('Gold Standard', 'Get one of your posts bumped to gold', '⭐', 30, 'community', 'has_gold_post', 1),
  ('Spin Lucky', 'Land a rare or better prize on the daily spin', '🎰', 15, 'game', 'rare_spin', 1)
on conflict (name) do nothing;
