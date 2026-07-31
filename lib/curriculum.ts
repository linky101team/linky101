export type CurriculumColor = "sky" | "pink" | "green" | "orange" | "yellow" | "purple" | "sky-deep";

export interface CurriculumCategory {
  slug: string;
  title: string;
  levelUnlock: number;
  emoji: string;
  color: CurriculumColor;
  lessonTitles: string[];
}

/** Must stay in sync with the `category`/`order_index` values seeded in 020_curriculum_seed.sql. */
export const CURRICULUM_CATEGORIES: CurriculumCategory[] = [
  {
    slug: "business_basics",
    title: "Business Basics",
    levelUnlock: 1,
    emoji: "🏢",
    color: "sky",
    lessonTitles: ["What IS a Business?", "Finding Your Idea", "Who's Your Customer?", "Your First Sale"],
  },
  {
    slug: "brand_building",
    title: "Brand Building",
    levelUnlock: 2,
    emoji: "🎨",
    color: "pink",
    lessonTitles: ["Choosing a Business Name", "Design Your Brand", "Your Brand Story", "Social Media Setup"],
  },
  {
    slug: "making_money",
    title: "Making Money",
    levelUnlock: 3,
    emoji: "💰",
    color: "green",
    lessonTitles: ["Pricing Your Product", "Selling Online", "Selling In Person", "Getting Your First 10 Customers"],
  },
  {
    slug: "pitch_perfect",
    title: "Pitch Perfect",
    levelUnlock: 4,
    emoji: "🎤",
    color: "orange",
    lessonTitles: ["What is a Pitch?", "Building a Pitch Deck", "Presenting with Confidence", "Pitching to Investors"],
  },
  {
    slug: "money_management",
    title: "Money Management",
    levelUnlock: 5,
    emoji: "📒",
    color: "yellow",
    lessonTitles: ["Tracking Your Money", "Profit vs Revenue", "Saving & Reinvesting", "Taxes for Teens"],
  },
  {
    slug: "grow_scale",
    title: "Grow & Scale",
    levelUnlock: 7,
    emoji: "🚀",
    color: "purple",
    lessonTitles: ["Hiring Help", "Customer Service", "Marketing on a Budget", "Partnerships & Collabs"],
  },
  {
    slug: "advanced",
    title: "Advanced",
    levelUnlock: 10,
    emoji: "🏆",
    color: "sky-deep",
    lessonTitles: ["Building a Website", "Email Marketing", "Analytics & Data", "Scaling Your Business"],
  },
];

export const CURRICULUM_COLOR_CLASSES: Record<
  CurriculumColor,
  { border: string; bg: string; text: string; glow: string }
> = {
  sky: { border: "border-sky", bg: "bg-sky", text: "text-sky", glow: "shadow-glow-sky" },
  pink: { border: "border-pink", bg: "bg-pink", text: "text-pink", glow: "shadow-glow-pink" },
  green: { border: "border-green", bg: "bg-green", text: "text-green", glow: "shadow-glow-green" },
  orange: { border: "border-orange", bg: "bg-orange", text: "text-orange", glow: "shadow-glow-sky" },
  yellow: { border: "border-yellow", bg: "bg-yellow", text: "text-yellow", glow: "shadow-glow-yellow" },
  purple: { border: "border-purple", bg: "bg-purple", text: "text-purple", glow: "shadow-glow-purple" },
  "sky-deep": { border: "border-sky-deep", bg: "bg-sky-deep", text: "text-sky-deep", glow: "shadow-glow-sky" },
};

export function getCategoryBySlug(slug: string): CurriculumCategory | undefined {
  return CURRICULUM_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryIndex(slug: string): number {
  return CURRICULUM_CATEGORIES.findIndex((c) => c.slug === slug);
}
