-- Seed the opportunities board. Unlike mentors (which reference real
-- auth.users rows and can't be faked), opportunities are admin-authored
-- content with no such dependency, so they're safe to seed directly.

insert into opportunities (title, description, category, age_min, age_max, deadline, link, location, is_active)
values
  (
    'Young Founders Pitch Competition',
    'Pitch your business idea to a panel of real investors for a chance to win $1,000 in seed funding.',
    'competition',
    13,
    18,
    (current_date + interval '10 days')::date,
    'https://example.com/pitch-competition',
    'Online',
    true
  ),
  (
    'Teen Entrepreneur Micro-Grant',
    'A no-strings-attached $250 grant to help you buy your first batch of supplies or launch your website.',
    'grant',
    14,
    18,
    (current_date + interval '25 days')::date,
    'https://example.com/micro-grant',
    'Online',
    true
  ),
  (
    'Startup Studio Summer Internship',
    'Shadow a founder building a real startup and help out with marketing, research, and operations.',
    'work_experience',
    16,
    18,
    (current_date + interval '45 days')::date,
    'https://example.com/summer-internship',
    'Remote',
    true
  ),
  (
    '1:1 Mentorship with a Local Founder',
    'Get matched with a founder in your area for monthly video calls and honest feedback on your idea.',
    'mentorship',
    13,
    18,
    null,
    'https://example.com/mentorship-match',
    'Online',
    true
  ),
  (
    'Youth Business Summit',
    'A one-day virtual summit with talks from founders who started before turning 20.',
    'event',
    13,
    18,
    (current_date + interval '5 days')::date,
    'https://example.com/youth-summit',
    'Online',
    true
  ),
  (
    'Free Canva Pro for Student Founders',
    'A curated guide to claiming free design tools built for teen entrepreneurs.',
    'resource',
    13,
    18,
    null,
    'https://example.com/free-tools-guide',
    'Online',
    true
  ),
  (
    'Green Business Challenge',
    'Design a business that solves an environmental problem in your community. Top 3 win mentorship + funding.',
    'competition',
    13,
    17,
    (current_date + interval '3 days')::date,
    'https://example.com/green-challenge',
    'Online',
    true
  ),
  (
    'Local Market Vendor Weekend',
    'Reserve a free table at your city''s weekend market to sell your product in person.',
    'work_experience',
    15,
    18,
    (current_date + interval '14 days')::date,
    'https://example.com/vendor-weekend',
    'In-person — check your city',
    true
  );
