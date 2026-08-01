export interface AmbassadorTag {
  label: string;
  bg: string;
  text: string;
}

export interface Ambassador {
  id: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  bio: string;
  tags: AmbassadorTag[];
  /** UK region, used by the region browser on Discover. */
  region?: string;
  /**
   * The ambassador's single piece of advice for the next generation.
   *
   * DELIBERATELY EMPTY. Everyone listed here is a real, named person — putting
   * invented quotes in their mouths and publishing it would be misrepresenting
   * them, and is the kind of thing that ends a relationship with an ambassador
   * (or worse) rather than starting one. Fill each of these in only with words
   * the person has actually given you permission to publish. Cards render a
   * neutral placeholder until then.
   */
  advice?: string;
  /** LinkedIn or public profile URL — again, only add once confirmed. */
  linkedin?: string;
}

export const AMBASSADORS: Ambassador[] = [
  {
    id: "nick-newman",
    initials: "NN",
    color: "#F59E0B",
    name: "Nick Newman",
    role: "CEO · National Careers Week CIC",
    bio: "Founder of National Careers Week, helping millions of young people across the UK find their path every year.",
    tags: [
      { label: "Careers", bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
      { label: "Education", bg: "bg-[#D1FAE5]", text: "text-[#059669]" },
      { label: "Strategy", bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
    ],
  },
  {
    id: "jason-stockwood",
    initials: "JS",
    color: "#7C3AED",
    name: "Lord Jason Stockwood",
    role: "Minister for Investment · UK Government",
    bio: "Grimsby-born entrepreneur and former CEO of Simply Business, now championing investment across the UK.",
    region: "Yorkshire",
    tags: [
      { label: "Investment", bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
      { label: "Government", bg: "bg-[#FCE7F3]", text: "text-[#DB2777]" },
    ],
  },
  {
    id: "bailey-greetham-clark",
    initials: "BG",
    color: "#EC4899",
    name: "Bailey Greetham-Clark",
    role: "Founder · Be Great Fitness · Grimsby",
    bio: "Started Be Great Fitness as a teenager in Grimsby. TEDx speaker on young people and social impact.",
    region: "Yorkshire",
    tags: [
      { label: "Social Impact", bg: "bg-[#D1FAE5]", text: "text-[#059669]" },
      { label: "TEDx Speaker", bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
    ],
  },
  {
    id: "owen-clater",
    initials: "OC",
    color: "#06B6D4",
    name: "Owen Clater",
    role: "CEO · Becks and Clates",
    bio: "Runs Becks and Clates, building brands and marketing that actually connects with people.",
    tags: [
      { label: "Marketing", bg: "bg-[#CFFAFE]", text: "text-[#0891B2]" },
      { label: "Tech", bg: "bg-[#E0E7FF]", text: "text-[#4F46E5]" },
    ],
  },
];
