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
    border: "border-[#FF6B6B]",
    text: "text-[#FF6B6B]",
    glow: "",
    bg: "bg-[#FFF0F0]",
  },
  marketing_branding: {
    label: "Marketing & Branding",
    emoji: "📣",
    border: "border-[#039BE5]",
    text: "text-[#039BE5]",
    glow: "",
    bg: "bg-[#E3F2FD]",
  },
  money_finance: {
    label: "Money & Finance",
    emoji: "💰",
    border: "border-[#2ECC71]",
    text: "text-[#2ECC71]",
    glow: "",
    bg: "bg-[#E8F5E9]",
  },
  leadership_teams: {
    label: "Leadership & Teams",
    emoji: "🤝",
    border: "border-[#7C3AED]",
    text: "text-[#7C3AED]",
    glow: "",
    bg: "bg-[#F3E8FF]",
  },
  founder_stories: {
    label: "Real Founder Stories",
    emoji: "🌟",
    border: "border-[#F5A623]",
    text: "text-[#F5A623]",
    glow: "",
    bg: "bg-[#FFF8E1]",
  },
  digital_tech: {
    label: "Digital & Tech",
    emoji: "💻",
    border: "border-[#FFD93D]",
    text: "text-[#B8860B]",
    glow: "",
    bg: "bg-[#FFFDE7]",
  },
};

export function getQuizCategoryStyle(category: string | null): QuizCategoryStyle {
  return QUIZ_CATEGORIES[category ?? ""] ?? {
    label: category ?? "General",
    emoji: "🧠",
    border: "border-gray-200",
    text: "text-gray-500",
    glow: "",
    bg: "bg-gray-50",
  };
}
