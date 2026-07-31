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
}

export const AMBASSADORS: Ambassador[] = [
  {
    id: "nick-newman",
    initials: "NN",
    color: "#FFC107",
    name: "Nick Newman",
    role: "CEO · National Careers Week CIC",
    bio: "Founder of National Careers Week, helping millions of young people across the UK find their path every year.",
    tags: [
      { label: "Careers", bg: "bg-[#FFF8E1]", text: "text-[#B8860B]" },
      { label: "Education", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
      { label: "Strategy", bg: "bg-[#E3F2FD]", text: "text-[#039BE5]" },
    ],
  },
  {
    id: "jason-stockwood",
    initials: "JS",
    color: "#A78BFA",
    name: "Lord Jason Stockwood",
    role: "Minister for Investment · UK Government",
    bio: "Grimsby-born entrepreneur and former CEO of Simply Business, now championing investment across the UK.",
    tags: [
      { label: "Investment", bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
      { label: "Government", bg: "bg-[#FFF0F0]", text: "text-[#FF6B6B]" },
    ],
  },
  {
    id: "bailey-greetham-clark",
    initials: "BG",
    color: "#F5A623",
    name: "Bailey Greetham-Clark",
    role: "Founder · Be Great Fitness · Grimsby",
    bio: "Started Be Great Fitness as a teenager in Grimsby. TEDx speaker on young people and social impact.",
    tags: [
      { label: "Social Impact", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
      { label: "TEDx Speaker", bg: "bg-[#FFF8E1]", text: "text-[#B8860B]" },
    ],
  },
  {
    id: "owen-clater",
    initials: "OC",
    color: "#FF6B6B",
    name: "Owen Clater",
    role: "CEO · Becks and Clates",
    bio: "Runs Becks and Clates, building brands and marketing that actually connects with people.",
    tags: [
      { label: "Marketing", bg: "bg-[#FFF0F0]", text: "text-[#FF6B6B]" },
      { label: "Tech", bg: "bg-[#E3F2FD]", text: "text-[#039BE5]" },
    ],
  },
];
