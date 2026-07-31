/**
 * Keyword-matched canned responses used when OPENAI_API_KEY isn't set.
 * Not a real AI — just enough to keep the chatbot useful out of the box.
 */

interface FallbackRule {
  keywords: string[];
  response: string;
}

const RULES: FallbackRule[] = [
  {
    keywords: ["level up", "xp", "experience"],
    response:
      "You earn XP from daily tasks, quizzes, streaks, and community activity. Complete your 5 daily tasks for a big chunk, and don't forget quizzes give bonus XP too!",
  },
  {
    keywords: ["coin", "linkcoin", "shop"],
    response:
      "LinkCoins come from daily tasks (5 each), spins, streaks, and achievements. Spend them in the Shop on frames, name colours, titles, banners, and more — check /shop!",
  },
  {
    keywords: ["streak"],
    response:
      "Your streak grows every day you complete at least one task. Miss a day and it resets — unless you've got a Streak Shield from the spin wheel or shop to protect it!",
  },
  {
    keywords: ["mentor"],
    response:
      "Mentor Q&A unlocks at Level 15. Once you're there, you can ask real mentors business questions and rate their answers!",
  },
  {
    keywords: ["premium", "subscription", "upgrade"],
    response:
      "Premium (£3.99/month) gets you a bonus daily spin, exclusive quizzes, premium flairs, and priority mentor access. Check it out on your Profile!",
  },
  {
    keywords: ["team", "school"],
    response:
      "Your Teams page shows your school's challenge progress and leaderboard. The more your team contributes, the more everyone earns!",
  },
  {
    keywords: ["quiz"],
    response:
      "Head to /quizzes for 15 quizzes across 6 categories — Starting a Business, Marketing, Money, Leadership, Founder Stories, and Digital & Tech. First attempts earn XP!",
  },
  {
    keywords: ["podcast"],
    response: "Podcasts unlock at Level 3 — find them under the Podcasts tab on the Learn page!",
  },
  {
    keywords: ["business idea", "start a business", "business plan"],
    response:
      "A great first step is finding a real problem you can solve for people you understand well. Talk to a few potential customers before building anything — that's the fastest way to know if an idea has legs!",
  },
  {
    keywords: ["marketing", "brand"],
    response:
      "Good marketing starts with knowing exactly who you're talking to. A brand is more than a logo — it's the feeling people get from every interaction with you. Consistency builds trust over time.",
  },
  {
    keywords: ["money", "finance", "budget", "profit"],
    response:
      "Track what comes in and what goes out — that's the foundation of any healthy business. Profit is what's left after costs, not just your total sales!",
  },
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hey! I'm Linky, your business buddy on LinkY101. Ask me about levelling up, quizzes, mentors, or anything entrepreneurship-related!",
  },
  {
    keywords: ["thank"],
    response: "You're welcome! Good luck out there — you've got this. 🚀",
  },
];

const DEFAULT_RESPONSE =
  "I'm running in offline mode right now, so I can only help with LinkY101 basics — try asking about levels, XP, streaks, quizzes, mentors, or the shop!";

export function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.response;
    }
  }
  return DEFAULT_RESPONSE;
}
