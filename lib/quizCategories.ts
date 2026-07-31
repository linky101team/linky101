export interface QuizCategoryStyle {
  label: string;
  emoji: string;
  border: string;
  text: string;
  glow: string;
  bg: string;
}

export const QUIZ_CATEGORIES: Record<string, QuizCategoryStyle> = {
  starting_a_business: {
    label: "Starting a Business",
    emoji: "🚀",
    border: "border-pink",
    text: "text-pink",
    glow: "shadow-glow-pink",
    bg: "bg-gradient-pink-purple",
  },
  marketing_branding: {
    label: "Marketing & Branding",
    emoji: "📣",
    border: "border-sky",
    text: "text-sky",
    glow: "shadow-glow-sky",
    bg: "bg-gradient-sky-purple",
  },
  money_finance: {
    label: "Money & Finance",
    emoji: "💰",
    border: "border-green",
    text: "text-green",
    glow: "shadow-glow-green",
    bg: "bg-gradient-green-sky",
  },
  leadership_teams: {
    label: "Leadership & Teams",
    emoji: "🤝",
    border: "border-purple",
    text: "text-purple",
    glow: "shadow-glow-purple",
    bg: "bg-gradient-purple-pink",
  },
  founder_stories: {
    label: "Real Founder Stories",
    emoji: "🌟",
    border: "border-orange",
    text: "text-orange",
    glow: "",
    bg: "bg-gradient-yellow-orange",
  },
  digital_tech: {
    label: "Digital & Tech",
    emoji: "💻",
    border: "border-yellow",
    text: "text-yellow",
    glow: "shadow-glow-yellow",
    bg: "bg-gradient-yellow-orange",
  },
};

export function getQuizCategoryStyle(category: string | null): QuizCategoryStyle {
  return QUIZ_CATEGORIES[category ?? ""] ?? {
    label: category ?? "General",
    emoji: "🧠",
    border: "border-border",
    text: "text-text-muted",
    glow: "",
    bg: "bg-card",
  };
}
