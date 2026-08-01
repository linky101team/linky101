# LinkY101 — working context

Read this before changing anything. It records decisions that were made
deliberately, often after several wrong attempts. Undoing one of these because
it looks like an oversight is the single most annoying thing that can happen to
this project.

Lucy owns this product. She is under 18. Her mum is involved in product
decisions and is the responsible adult for the legal/safeguarding side.

---

## What this is

A professional networking and entrepreneurship platform for **13–19 year olds**
in the UK. Think "LinkedIn before LinkedIn" — young founders learn real business
skills, share ideas, and get inspiration from real entrepreneurs.

Live at `linky101.netlify.app`. Repo `linky101team/linky101`, auto-deploys from
`main` to Netlify. Supabase project `trfneqkiusjveckuisif`.

---

## Hard rules — do not undo these

**The logo is `LinkY` in black (`#111111`) and `101` in gold (`#F5B301`).**
Not red. Not a gradient. Not purple. This has been broken and re-fixed three
times. If you touch a component with the wordmark in it, keep those two colours.

**There is no social posts feed.** A feed of user status updates was built and
then deliberately removed — Lucy's words: "i dont want the posts feed as you will
make them bad". `/community` redirects to `/dreams`. Idea-sharing happens on the
**Dream Wall**, which is a different thing: aspirational ideas that get voted up,
not a running activity stream. Do not reintroduce a posts feed. Do not invent
sample social posts.

**Ambassadors and Mentors are two different things. Never merge them.**

| | Ambassadors | Mentors |
|---|---|---|
| How they join | Can self sign up | Hand-picked by Lucy only |
| DBS checked | No | Yes |
| Age check | Must pass an over-18 verification step before being listed | Vetted directly |
| Private 1-to-1 messaging with under-18s | **Never** | Yes, under Pro |
| What they do | One public piece of advice, answer questions publicly | Direct support |

There must be no UI anywhere implying private contact between an **ambassador**
and a young founder. A "Message 1-on-1" button on an ambassador card is a
safeguarding bug, not a feature. `role` in the database is limited to
`founder | ambassador` — "mentor" is deliberately not self-selectable and lives
in the separate `mentors` table.

**Never invent quotes for real, named people.** `lib/ambassadors.ts` lists real
individuals (Nick Newman, Lord Jason Stockwood, Bailey Greetham-Clark, Owen
Clater). Their `advice` fields are intentionally empty and the UI shows a
"coming soon" placeholder. Only fill them with words those people have actually
given permission to publish. Same for `linkedin` URLs.

**No gamification.** Levels, XP, LinkCoins, spin wheels, achievements and flair
were all removed on purpose — Lucy: "no levels or xp... entrepreneurs want it
instantly". Streaks stayed (they're honest effort tracking). Some dead
gamification tables and routes still exist in the codebase and schema (shop,
teams, leaderboard, `link_coins`, `profile_flair`); these are cruft to delete,
not features to revive.

**Daily tasks must tick themselves.** Lucy: "you cant just tick off yourself you
have to genuinely build it". Home queries real completion (`curriculum_progress`,
`podcast_listens`, `mentor_questions`) — never add a manual checkbox.

**The Idea Validator must be deterministic.** The original prototype scored
ideas with `Math.random()`, so the same idea got a different score each press.
`lib/ideaValidator.ts` scores against a fixed rubric instead, and every score
explains itself. Do not replace it with random numbers or an unexplained AI
score.

---

## Design system

Vibrant, high-energy — this is deliberately not a calm corporate palette.

```
purple  #7C3AED   primary accent
pink    #EC4899
cyan    #06B6D4
bg      #F5F3FF   light lavender page background
ink     #1E1B4B   headings
gold    #F5B301   logo "101" only
```

Signature gradient: `linear-gradient(135deg, #7C3AED, #EC4899, #06B6D4)` —
available as `.grad-hero`, with `.grad-brand`, `.grad-cool`, `.grad-gold` and
`.text-grad` in `app/globals.css`.

Cards are white, 16–24px radius, soft purple-tinted shadows. Rounded-full
buttons. Real Lucide icons, not emoji, for anything structural — emoji are fine
as decoration in headings.

**Semantic tokens re-skin the whole app.** `text-ink`, `text-text-muted`,
`border-border`, `bg-card`, `bg-bg`, `text-sky` are used hundreds of times and
are defined as CSS variables in `globals.css`. Changing a variable's value
re-themes everything at once — prefer that over editing files individually.
`sky` currently points at Launchpad purple.

It must look genuinely good on desktop as a full-width web app. An earlier
version rendered the whole desktop experience inside a fake phone frame floating
in empty space; Lucy hated it and she was right. Desktop = sidebar + content +
right rail. Mobile = top bar + content + bottom tabs.

---

## Structure

**Top bar** (everywhere): streak flame + day count on the left, notifications
bell on the right opening a "What's new" panel, then the initials avatar linking
to Profile. The notifications panel holds *platform announcements* (the Monday
Top 20 drop, "how to pitch your idea — start now", new episodes) — not other
users' activity.

**Five main tabs**: Home, Learn, Podcasts, Discover, Profile.

- **Home** — today's three tasks (complete a lesson / listen to the podcast /
  ask a question), then "continue where you left off" with course progress, then
  the Top 50 Ideas card and the Monday 9AM Weekly Q&A card.
- **Learn** — course grid + quizzes. Podcasts used to be a tab here; it is now
  its own page because it's a headline feature.
- **Podcasts** — featured episode, category filter, episode list, full audio
  player (`components/PodcastPlayer.tsx`) with speed control and minimise.
- **Discover** — hub: Ask LinkY AI, Ambassadors, Dream Wall, Founder Tools,
  Opportunities, and browse-by-UK-region.
- **Profile** — role badge (Founder / Ambassador), region, stats.

Also: `/dreams` (Dream Wall), `/tools` (Idea Validator + 5-step Pitch Deck
Creator), `/mentors` (ambassador directory), `/premium`, `/opportunities`.

---

## Stack

Next.js 14 App Router · TypeScript · Tailwind · Supabase (auth, Postgres,
Storage) · framer-motion · Lucide · deployed on Netlify.

Auth is middleware-based (`middleware.ts`), `PUBLIC_ROUTES = /signup /login
/verify`. Migrations live in `supabase/migrations/` and are run manually by
pasting into the Supabase SQL editor — there is no automated migration step, so
if you add one, tell Lucy explicitly that she needs to run it.

`.env.local` is gitignored. A build will fail without
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set.

**The live database has drifted from these migration files.** Do not assume the
schema in `supabase/migrations/` matches production. Two known cases: `profiles`
already had a `role` column holding values outside founder/ambassador, and a
legacy `dreams` table exists with a different shape (`profile_id`/`text`) which
is why the Dream Wall uses `dream_wall_posts` / `dream_wall_likes` instead. That
legacy `dreams` table is untouched and should be reviewed and dropped once
you've confirmed nothing reads from it. Before writing a migration, check what
is actually there:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name in ('the_table')
order by ordinal_position;
```

---

## Known gaps

- Ambassador advice quotes and LinkedIn URLs are empty pending real permission.
- The Monday 9AM Top 20 drop is presented in the UI but there is no scheduled
  job actually selecting and publishing them yet.
- LinkY AI (`/api/linky-ai`) falls back to canned keyword responses without an
  `OPENAI_API_KEY`. Its system prompt still says ages 13–18; should be 13–19.
- Ambassador over-18 verification is a UI step only. Real age verification needs
  a third-party service and costs money — a self-declared tickbox is not
  verification and shouldn't be described as one.
- Onboarding does not yet collect `region` or `role`, though both columns exist.
- Legacy gamification routes still exist and should be deleted: `/shop`,
  `/teams`, `/leaderboard`, `/profile/flair`, `/roadmap`.
- No Stripe integration yet for Pro. Lucy is under 18, so payments must be set
  up under her mum or a company.
- Content (lessons, podcast episodes, ambassadors) is largely placeholder. Real
  content is Lucy's job and is the actual blocker to launch.

## Legal and safeguarding context

A UK platform where under-18s post content others can see. The ICO Children's
Code applies to their data and the Online Safety Act applies to user-generated
content. Terms, a privacy policy, a moderation route and a working report button
are requirements, not polish. `ReportButton` exists and is wired into dreams —
keep it on any new user-generated content surface.

Lucy is under 18, so her mum is the account holder, data controller and the
person who would take payments.

## Working with Lucy

She is fast, ambitious and building this for real — schools are a genuine target
customer, so "looks like a real product" matters as much as it working. She gets
(reasonably) frustrated when something she explicitly asked for gets quietly
changed back. If you're unsure between two interpretations, ask rather than
guess. Verify things actually render before saying they're done.
