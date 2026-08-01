-- ============================================================
-- LinkY101: Add a podcast episode
-- Run this AFTER you've uploaded your MP3 (steps below).
--
-- HOW TO UPLOAD THE AUDIO:
-- 1. Supabase dashboard → Storage → New bucket
--    Name it:  podcasts     and tick "Public bucket" → Create
-- 2. Open the podcasts bucket → Upload file → pick your MP3
--    (e.g. episode1.mp3)
-- 3. Click the file → Copy URL — it looks like:
--    https://trfneqkiusjveckuisif.supabase.co/storage/v1/object/public/podcasts/episode1.mp3
-- 4. Paste that URL below where it says YOUR_AUDIO_URL_HERE,
--    edit the title/description/duration, then Run this file
--    in Supabase → SQL Editor.
--
-- duration_seconds: length of the episode in seconds
--    (e.g. 8 minutes 30 seconds = 510)
-- category options: starting_a_business, marketing_branding,
--    money_finance, leadership_teams, founder_stories, digital_tech
-- ============================================================

insert into podcasts (title, description, episode_number, audio_url, duration_seconds, category, is_published)
values (
  'Meet LinkY101',                                     -- title
  'Why we built a professional network for teens.',    -- description
  1,                                                   -- episode number
  'YOUR_AUDIO_URL_HERE',                               -- paste the storage URL
  510,                                                 -- length in seconds
  'founder_stories',                                   -- category
  true                                                 -- published (visible in app)
);
