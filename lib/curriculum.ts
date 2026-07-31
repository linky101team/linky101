export type CurriculumColor = "sky" | "pink" | "green" | "orange" | "yellow" | "purple" | "sky-deep";

export interface CurriculumCategory {
  slug: string;
  title: string;
  emoji: string;
  color: CurriculumColor;
  lessonTitles: string[];
}

export const CURRICULUM_CATEGORIES: CurriculumCategory[] = [
  {
    slug: "business_basics",
    title: "Business Basics",
    emoji: "🏢",
    color: "sky",
    lessonTitles: ["What IS a Business?", "Finding Your Idea", "Who's Your Customer?", "Your First Sale"],
  },
  {
    slug: "brand_building",
    title: "Brand Building",
    emoji: "🎨",
    color: "pink",
    lessonTitles: ["Choosing a Business Name", "Design Your Brand", "Your Brand Story", "Social Media Setup"],
  },
  {
    slug: "making_money",
    title: "Making Money",
    emoji: "💰",
    color: "green",
    lessonTitles: ["Pricing Your Product", "Selling Online", "Selling In Person", "Getting Your First 10 Customers"],
  },
  {
    slug: "pitch_perfect",
    title: "Pitch Perfect",
    emoji: "🎤",
    color: "orange",
    lessonTitles: ["What is a Pitch?", "Building a Pitch Deck", "Presenting with Confidence", "Pitching to Investors"],
  },
  {
    slug: "money_management",
    title: "Money Management",
    emoji: "📒",
    color: "yellow",
    lessonTitles: ["Tracking Your Money", "Profit vs Revenue", "Saving & Reinvesting", "Taxes for Teens"],
  },
  {
    slug: "grow_scale",
    title: "Grow & Scale",
    emoji: "🚀",
    color: "purple",
    lessonTitles: ["Hiring Help", "Customer Service", "Marketing on a Budget", "Partnerships & Collabs"],
  },
  {
    slug: "advanced",
    title: "Advanced",
    emoji: "🏆",
    color: "sky-deep",
    lessonTitles: ["Building a Website", "Email Marketing", "Analytics & Data", "Scaling Your Business"],
  },
];

export const CURRICULUM_COLOR_CLASSES: Record<
  CurriculumColor,
  { bg: string; bgLight: string; text: string }
> = {
  sky: { bg: "bg-[#039BE5]", bgLight: "bg-[#E3F2FD]", text: "text-[#039BE5]" },
  pink: { bg: "bg-[#FF6B6B]", bgLight: "bg-[#FFF0F0]", text: "text-[#FF6B6B]" },
  green: { bg: "bg-[#2ECC71]", bgLight: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
  orange: { bg: "bg-[#F5A623]", bgLight: "bg-[#FFF8E1]", text: "text-[#F5A623]" },
  yellow: { bg: "bg-[#FFD93D]", bgLight: "bg-[#FFFDE7]", text: "text-[#FFD93D]" },
  purple: { bg: "bg-[#7C3AED]", bgLight: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
  "sky-deep": { bg: "bg-[#0288D1]", bgLight: "bg-[#E1F5FE]", text: "text-[#0288D1]" },
};

export function getCategoryBySlug(slug: string): CurriculumCategory | undefined {
  return CURRICULUM_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryIndex(slug: string): number {
  return CURRICULUM_CATEGORIES.findIndex((c) => c.slug === slug);
}
