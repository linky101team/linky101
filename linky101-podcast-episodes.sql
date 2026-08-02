-- ============================================================
-- LinkY101 · Podcast episodes 2–6
-- Run AFTER uploading the five files from your
-- Downloads\linky101-podcasts folder into the `podcasts` bucket.
-- Keep the filenames exactly as they are.
--
-- Paste the whole file into Supabase -> SQL Editor -> Run.
-- Click once in the editor first so nothing is highlighted.
-- Safe to run more than once.
-- ============================================================

insert into podcasts (title, description, episode_number, guest_name, audio_url, duration_minutes, published_date)
values
  (
    'We Stopped Strangers On The Street — Half Were Millionaires',
    'What happens when you actually ask people how they made their money.',
    2, null,
    'https://xjptxinpsqzljuwqavas.supabase.co/storage/v1/object/public/podcasts/strangers-millionaires.mp3',
    7, now()
  ),
  (
    'From 5p SIM Cards to a £7 Million Carpet Business',
    'Recorded live in front of 50 business students — how a side hustle at school turned into a seven-figure company.',
    3, null,
    'https://xjptxinpsqzljuwqavas.supabase.co/storage/v1/object/public/podcasts/carpet-business.mp3',
    32, now()
  ),
  (
    'The £2 Billion Founder Who Refuses To Sell',
    'Why turning down life-changing money can be the right call.',
    4, 'Paul Hamilton, Halo',
    'https://xjptxinpsqzljuwqavas.supabase.co/storage/v1/object/public/podcasts/paul-hamilton-halo.mp3',
    53, now()
  ),
  (
    'How To Build A Business In 2026',
    'A founder who sold for millions on what he would do if he were starting today.',
    5, null,
    'https://xjptxinpsqzljuwqavas.supabase.co/storage/v1/object/public/podcasts/build-a-business-2026.mp3',
    53, now()
  ),
  (
    'AI Isn''t Taking Your Jobs — Lazy CEOs Are',
    'Where AI actually changes work, and what to learn now because of it.',
    6, 'Danilo McGarry',
    'https://xjptxinpsqzljuwqavas.supabase.co/storage/v1/object/public/podcasts/danilo-mcgarry-ai.mp3',
    48, now()
  )
on conflict do nothing;

select episode_number, title, duration_minutes from podcasts order by episode_number;
