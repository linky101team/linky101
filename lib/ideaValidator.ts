/**
 * Deterministic idea scoring.
 *
 * The original prototype scored ideas with Math.random(), which meant the same
 * idea got a different score every time you pressed the button. That's worse
 * than useless on a platform teaching young people how to evaluate a business
 * — so this scores against a fixed rubric instead: same input, same score,
 * every time, and every score comes with the reason behind it.
 */

export interface Criterion {
  key: string;
  label: string;
  score: number;
  hit: boolean;
  tip: string;
}

export interface Validation {
  criteria: Criterion[];
  overall: number;
  verdict: string;
}

const CUSTOMER_SIGNALS = [
  "for people", "for teens", "for students", "for parents", "for kids", "for young",
  "for businesses", "for schools", "customers", "audience", "aimed at", "target",
  "for anyone", "for those", "for women", "for men", "for gamers", "for athletes",
];

const MONEY_SIGNALS = [
  "sell", "charge", "£", "$", "price", "pricing", "subscription", "monthly",
  "commission", "fee", "profit", "margin", "revenue", "paid", "pay", "cost",
  "per month", "per item", "free trial", "premium",
];

const DIFFERENCE_SIGNALS = [
  "unlike", "different", "better than", "instead of", "unlike other", "only",
  "first", "no one else", "nobody else", "competitors", "cheaper", "faster",
  "easier", "unique", "special", "compared to",
];

const PROBLEM_SIGNALS = [
  "problem", "struggle", "hard to", "difficult", "annoying", "frustrat",
  "can't find", "cant find", "no way to", "waste", "expensive", "takes ages",
  "nobody", "there isn't", "there isnt", "need",
];

function hits(text: string, signals: string[]): boolean {
  return signals.some((s) => text.includes(s));
}

export function validateIdea(raw: string): Validation {
  const text = raw.toLowerCase();
  const words = raw.trim().split(/\s+/).filter(Boolean).length;

  // Clarity scales with how much they actually explained, capped so an essay
  // doesn't automatically beat a sharp two-liner.
  const detailed = words >= 25;
  const clarityScore = Math.max(20, Math.min(100, Math.round((words / 45) * 100)));

  const criteria: Criterion[] = [
    {
      key: "clarity",
      label: "Clarity",
      score: clarityScore,
      hit: detailed,
      tip: detailed
        ? "You've explained it in enough detail to picture it."
        : "Add a couple more sentences — what exactly is it, and how does it work?",
    },
    {
      key: "problem",
      label: "Real problem",
      score: hits(text, PROBLEM_SIGNALS) ? 90 : 35,
      hit: hits(text, PROBLEM_SIGNALS),
      tip: hits(text, PROBLEM_SIGNALS)
        ? "You've named a problem this solves — that's the strongest starting point."
        : "Say what's broken right now. A business is a fix for something annoying.",
    },
    {
      key: "customer",
      label: "Clear customer",
      score: hits(text, CUSTOMER_SIGNALS) ? 90 : 40,
      hit: hits(text, CUSTOMER_SIGNALS),
      tip: hits(text, CUSTOMER_SIGNALS)
        ? "You know who it's for. That makes marketing ten times easier."
        : "Who exactly is this for? 'Everyone' isn't a customer — get specific.",
    },
    {
      key: "money",
      label: "Makes money",
      score: hits(text, MONEY_SIGNALS) ? 88 : 35,
      hit: hits(text, MONEY_SIGNALS),
      tip: hits(text, MONEY_SIGNALS)
        ? "You've thought about how it earns. Investors ask this first."
        : "How does it actually make money? What do people pay, and how much?",
    },
    {
      key: "difference",
      label: "Stands out",
      score: hits(text, DIFFERENCE_SIGNALS) ? 85 : 45,
      hit: hits(text, DIFFERENCE_SIGNALS),
      tip: hits(text, DIFFERENCE_SIGNALS)
        ? "You've said why yours is different. That's your edge."
        : "Why you and not the obvious alternative? Name what makes yours better.",
    },
  ];

  const overall = Math.round(criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length);

  const verdict =
    overall >= 80
      ? "🔥 Strong idea — you've covered the big questions. Go talk to 10 real customers this week."
      : overall >= 60
        ? "💪 Solid foundation. Tighten up the gaps below and this gets sharp fast."
        : "🌱 Early days — and that's fine. Every great business started this rough. Work through the tips.";

  return { criteria, overall, verdict };
}
