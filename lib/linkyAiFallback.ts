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
    keywords: ["pitch deck", "pitch"],
    response:
      "A great pitch is short, clear, and tells people why THEY should care 🎤 Keep it to 60 seconds: the problem, your idea, and what makes you different. Check out the Pitch Perfect lessons in Learn for the full deck-by-deck guide!",
  },
  {
    keywords: ["level", "xp"],
    response:
      "You level up by earning XP from tasks, quizzes, streaks, and community activity — levels go all the way to 30! 🚀 Each level unlocks something new: Level 3 = Podcasts, Level 10 = Opportunities, Level 15 = Mentors. Tap your level badge anywhere to see your progress!",
  },
  {
    keywords: ["linkcoin", "coin", "shop"],
    response:
      "LinkCoins are your in-app currency 🪙 Earn them from daily tasks, spins, streaks, and achievements, then spend them in the Shop on frames, name colours, titles, banners, and more. Check your balance on the Shop page!",
  },
  {
    keywords: ["streak", "daily"],
    response:
      "Complete at least one task each day to keep your streak alive 🔥 Hit milestones (3, 7, 14, 30 days) for bonus XP and coins, and grab a Streak Shield from the shop so a missed day doesn't reset you!",
  },
  {
    keywords: ["quiz", "learn"],
    response:
      "Quizzes cover 6 categories — Starting a Business, Marketing, Money, Leadership, Founder Stories, and Digital & Tech 🧠 Your first attempt on each one earns XP, and lessons in the Learn tab earn XP + LinkCoins too!",
  },
  {
    keywords: ["mentor"],
    response:
      "Mentor Q&A unlocks at Level 15 🤝 Once you're there, you can ask real mentors business questions and rate their answers — look out for the 🏆 Top Mentor badge on the best-rated ones!",
  },
  {
    keywords: ["podcast"],
    response:
      "Podcasts unlock at Level 3 🎧 Find them under the Podcasts tab on the Learn page — each episode you finish earns you XP and LinkCoins!",
  },
  {
    keywords: ["team"],
    response:
      "Teams are all about your school! 🏫 You can join a team from Level 5, and create one of your own from Level 7. Team challenges earn XP for the whole squad — check the Teams tab!",
  },
  {
    keywords: ["opportunit"],
    response:
      "The Opportunities Board unlocks at Level 10 🎯 You'll find real competitions, grants, work experience, and more there — perfect for putting what you've learned into practice!",
  },
  {
    keywords: ["business idea", "start a business", "business plan"],
    response:
      "A great first step is finding a real problem you can solve for people you understand well 💡 Talk to a few potential customers before building anything — that's the fastest way to know if an idea has legs. The Business Basics lessons walk through this step by step!",
  },
  {
    keywords: ["marketing", "brand"],
    response:
      "Good marketing starts with knowing exactly who you're talking to 📣 A brand is more than a logo — it's the feeling people get from every interaction with you. Check out the Brand Building lessons!",
  },
  {
    keywords: ["money", "finance", "budget", "profit"],
    response:
      "Track what comes in and what goes out — that's the foundation of any healthy business 💰 Profit is what's left after costs, not just your total sales. The Money Management lessons cover all of this!",
  },
  {
    keywords: ["help"],
    response:
      "Happy to help! 😊 Ask me about: levels & XP, LinkCoins & the shop, streaks, quizzes, mentors, podcasts, teams, opportunities, or pitching your idea. What do you want to know?",
  },
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hey! I'm Linky, your business buddy on LinkY101 👋 Ask me about levelling up, quizzes, mentors, or anything entrepreneurship-related!",
  },
  {
    keywords: ["thank"],
    response: "You're welcome! Good luck out there — you've got this 🚀",
  },
];

const DEFAULT_RESPONSE = "Great question! Try asking about levels, XP, coins, quizzes, or teams! 😊";

export function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.response;
    }
  }
  return DEFAULT_RESPONSE;
}
