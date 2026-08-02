export interface Ambassador {
  id: string;
  initials: string;
  color: string;
  name: string;
  /** Job title / what they're known for, shown under the name. */
  role: string;
  /** Free-text display location, e.g. "Cambridge, United Kingdom". */
  location: string;
  /** UK region for the region filter. Omitted for non-UK ambassadors. */
  region?: string;
  sector: string;
  /** Bio paragraphs, rendered one under the other. */
  bio: string[];
  /** "Known for" chips. */
  tags: string[];
  /** Their single piece of advice for the next generation. */
  advice: string;
  /**
   * Whether this advice is cleared to publish under their name.
   *
   * Everyone here is a real, named, easily-findable person, so a quote that
   * isn't theirs is the kind of thing that turns a supporter into an
   * ex-supporter. The flag stays in place so any single person can be taken
   * back off with one edit if they ever ask.
   */
  adviceConfirmed: boolean;
  linkedin?: string;
}

export const AMBASSADOR_SECTORS = [
  "Education & Careers",
  "Media & Podcasting",
  "Tech & AI",
  "Marketing & Investing",
  "Health & Community",
  "Retail & E-commerce",
] as const;

export const AMBASSADORS: Ambassador[] = [
  {
    id: "atish-bhattacharjya",
    initials: "AB",
    color: "#F59E0B",
    name: "Atish Bhattacharjya",
    role: "Ex-Tripadvisor, Wish, eBay, Samsung",
    location: "London, United Kingdom",
    region: "London",
    sector: "Tech & AI",
    bio: [
      "🚀 I'm Atish, a Product Manager who's built products used by millions at eBay, Samsung, Wish and Tripadvisor. If you've ever switched from an iPhone to Samsung or booked a tour on Viator, you've used something I helped create.",
      "🌍 I grew up in India, worked in the USA and Switzerland, and now live in the UK. I volunteer for child welfare, education and helping young people into work.",
      "🤖 I now advise early stage startups through Connectd and build AI products on the side. I'm proof that curiosity and hard work can take you anywhere in the world.",
    ],
    tags: ["Ex-eBay", "Ex-Samsung", "Ex-Tripadvisor", "AI & Product", "Startup Advisor"],
    advice:
      "I started with nothing but curiosity and a willingness to learn. No connections, no shortcuts. I moved across four countries chasing the work I loved. You don't need to know where you'll end up. Just stay curious, keep building, and the opportunities will find you.",
    adviceConfirmed: true,
  },
  {
    id: "bailey-greetham-clark",
    initials: "BG",
    color: "#10B981",
    name: "Bailey Greetham-Clark",
    role: "Founder & CEO, BeGreatFitness",
    location: "Lincolnshire, United Kingdom",
    region: "East Midlands",
    sector: "Health & Community",
    bio: [
      "💪 I'm Bailey, Founder of BeGreatFitness, an award-winning community health and wellbeing company. We work with schools, care homes and charities to make exercise accessible for everyone.",
      "🗣️ I'm a TEDx speaker and was named in the Lincolnshire 30 Under 30. I started my business young and built it from the ground up right here in Lincolnshire.",
      "🔥 I'm proof that you don't need to move to London or wait until you're older to build something that actually matters in your community.",
    ],
    tags: ["BeGreatFitness", "TEDx Speaker", "30 Under 30", "Community Health", "Young Founder"],
    advice:
      "You don't need to be from a big city or have a big following to make a big difference. I started in Lincolnshire with nothing but an idea to help people get active. If you care about something enough, just start. Your community is waiting for you.",
    adviceConfirmed: true,
  },
  {
    id: "chris-ross",
    initials: "CR",
    color: "#F97316",
    name: "Chris Ross",
    role: "Founder, Datumra",
    location: "Manchester, United Kingdom",
    region: "North West",
    sector: "Tech & AI",
    bio: [
      "🚀 I'm Chris, Founder of Datumra, an AI operating system that helps founders and small businesses run everything from idea to execution.",
      "💡 Before Datumra I helped build a $2bn AI company from the inside, and saw first hand that the biggest thing holding young founders back isn't talent, it's access to the right tools and systems.",
      "🔥 I built Datumra to change that, so the next generation of founders can compete with anyone, no matter where they start.",
    ],
    tags: ["Datumra", "AI & Systems", "Startup Growth", "Founder Tools", "Ex-$2bn AI Builder"],
    advice:
      "You don't need a degree, connections or money to start. You just need to start. I spent years inside a $2bn company before I realised the best ideas come from people who don't wait for permission. Start building now, figure it out as you go, and don't let anyone tell you you're too young.",
    adviceConfirmed: true,
  },
  {
    id: "damian-hughes",
    initials: "DH",
    color: "#7C3AED",
    name: "Damian Hughes",
    role: "Author | Co-Host, The High Performance Podcast",
    location: "Manchester, United Kingdom",
    region: "North West",
    sector: "Media & Podcasting",
    bio: [
      "🎙️ I'm Damian, co-host of The High Performance Podcast with over 250 million downloads. I interview elite performers from sport, business and the arts to find out what makes them tick.",
      "📚 I've written eight bestselling books including a No.1 Sunday Times bestseller. My work has been translated into twelve languages and I'm a Professor at Manchester Metropolitan University.",
      "🧥 I also founded The School Coat Charity, providing coats for children living in poverty. Giving back matters just as much as winning.",
    ],
    tags: ["High Performance Podcast", "Bestselling Author", "TEDx Speaker", "School Coat Charity", "250M+ Downloads"],
    advice:
      "I've spoken to hundreds of the world's best performers and not one of them was born with it all figured out. The difference is they kept going when everyone else stopped. Talent gets you noticed. Consistency is what makes you great.",
    adviceConfirmed: true,
  },
  {
    id: "frankie-james",
    initials: "FJ",
    color: "#06B6D4",
    name: "Frankie James",
    role: "Co-Founder, The Ideas Community",
    location: "Cardiff, Wales",
    region: "Wales",
    sector: "Health & Community",
    bio: [
      "🎪 I'm Frankie, Co-Founder of The Ideas Community, a 100k strong network of entrepreneurs. I also created Ideas Fest, basically Glastonbury but for business.",
      "🏆 I run the Great British Entrepreneur Awards and UK StartUp Awards, with over 8,500 founders applying every year to be recognised for what they've built.",
      "🔥 My mission is simple: connect ambitious people, champion their ideas, and prove that the best businesses start with someone brave enough to try.",
    ],
    tags: ["Ideas Fest", "The Ideas Community", "GB Entrepreneur Awards", "Community Builder", "100k+ Entrepreneurs"],
    advice:
      "The best founders I've met didn't have a perfect plan. They just had the guts to start and the stubbornness to keep going. You don't need to know everything. You just need to show up and back yourself.",
    adviceConfirmed: true,
  },
  {
    id: "harrison-turner",
    initials: "HT",
    color: "#EC4899",
    name: "Harrison Turner",
    role: "Co-Founder, In The Business",
    location: "United Kingdom",
    sector: "Media & Podcasting",
    bio: [
      "🎙️ I'm Harrison, Co-Founder of In The Business. We make the \"What's Your Step One?\" podcast, taking founders back to the moment before they started, with 50+ episodes and guests featured on BBC Radio.",
      "🎬 We also run live events that get young people in a room with real founders, because meeting someone who's done it changes everything.",
      "🚀 My mission is to inspire 1,000,000 young people to seriously consider building something of their own.",
    ],
    tags: ["In The Business", "Step One Podcast", "BBC Radio", "Live Events", "Youth Entrepreneurship"],
    advice:
      "Every founder I've interviewed started the same way. No clue, no plan, just a feeling that they wanted to try. That's your step one. You don't need to have it figured out. You just need to start.",
    adviceConfirmed: true,
  },
  {
    id: "myles-shaw",
    initials: "MS",
    color: "#10B981",
    name: "Myles Shaw",
    role: "MD & Founder, Runrug.com | MD at GCW",
    location: "United Kingdom",
    sector: "Retail & E-commerce",
    bio: [
      "🏪 I'm Myles, I grew up in my dad's flooring shop and turned that into a group of retail stores and a global eCommerce brand. I now run The Positive Co. Ltd as MD and majority shareholder.",
      "🎤 I spend time speaking in schools and colleges, sharing my story and helping young people build confidence and find their direction.",
      "🔥 I post a one minute video every single day in 2026. No act, no agenda, just real talk about business, family and life.",
    ],
    tags: ["Runrug.com", "The Positive Co.", "School Speaker", "Daily Video Challenge", "eCommerce"],
    advice:
      "I grew up working in my dad's shop. No big plan, no grand vision. I just kept showing up, kept learning and kept building. You don't need to have it all figured out. Just be consistent, be yourself, and the rest will come.",
    adviceConfirmed: true,
  },
  {
    id: "nick-newman",
    initials: "NN",
    color: "#F59E0B",
    name: "Nick Newman",
    role: "CEO & Founder, National Careers Week",
    location: "Cambridge, United Kingdom",
    region: "East of England",
    sector: "Education & Careers",
    bio: [
      "🎯 I'm Nick, Founder of National Careers Week, Green Careers Week, Music Careers Week and National WEX Month. My whole life is about helping young people make better choices about their futures.",
      "🏫 I also founded Careersbox, the first free online careers video platform for schools, reaching thousands of schools across the UK.",
      "🤝 I'm always looking for passionate people to collaborate with. If you care about young people's futures, I want to hear from you.",
    ],
    tags: ["National Careers Week", "Green Careers Week", "5,000+ UK Schools", "Youth Futures", "Careersbox"],
    advice:
      "Don't just think about what job you want. Think about what life you want to live and work backwards from there. The best career is one you'd do even if nobody was watching. Find that thing and you'll never feel like you're working.",
    adviceConfirmed: true,
  },
  {
    id: "owen-clater",
    initials: "OC",
    color: "#06B6D4",
    name: "Owen Clater",
    role: "CEO, Becks & Clates | Angel Investor",
    location: "London, United Kingdom",
    region: "London",
    sector: "Marketing & Investing",
    bio: [
      "💼 I'm Owen, CEO of Becks & Clates, a performance marketing agency, and one of the UK's youngest angel investors with equity in 7+ startups across Tech, SaaS and AI.",
      "🎤 I'm an international business conference speaker and was recognised as the UK's youngest employer by major media outlets. I invest between £10k and £100k into B2C companies I believe in.",
      "🚀 I started young and I'm proof that age is irrelevant when it comes to building, investing and making things happen.",
    ],
    tags: ["Becks & Clates", "Angel Investor", "UK's Youngest Employer", "Conference Speaker", "Tech & AI"],
    advice:
      "I became one of the UK's youngest employers and angel investors not because I had some big advantage, but because I didn't wait. Age is just a number. If you've got an idea, back yourself. The worst thing that can happen is you learn something.",
    adviceConfirmed: true,
  },
  {
    id: "roei-samuel",
    initials: "RS",
    color: "#EC4899",
    name: "Roei Samuel",
    role: "CEO, Connectd",
    location: "United Kingdom",
    sector: "Tech & AI",
    bio: [
      "👋 I'm Roei (pronounced \"Roy\"), CEO of Connectd — helping founders find the experts, advisors and investors they need to grow.",
      "🧠 I have ADHD and dyslexia. Diagnosed young, and it took me years to realise that's exactly what makes me a better founder.",
      "🚀 Built Connectd from zero to $18M ARR, raised $23M, and been featured in the BBC, Forbes & The Telegraph.",
    ],
    tags: ["Connectd", "ADHD & Dyslexia Advocate", "Neurodiversity", "Founder Newsletter", "BBC / Forbes / Telegraph"],
    advice:
      "I used to sit in class thinking my brain was broken. It's not. It just works differently. If you feel like you're not good enough, you're wrong. You just haven't found your thing yet. Keep going.",
    adviceConfirmed: true,
  },
  {
    id: "sepehr-khosravi",
    initials: "SK",
    color: "#10B981",
    name: "Sepehr Khosravi",
    role: "Founder, AI Squads",
    location: "California, United States",
    sector: "Tech & AI",
    bio: [
      "🤖 I'm Sepehr, Founder of AI Squads, teaching 10,000+ students worldwide how to build with AI. I also teach at UC Berkeley, one of the top universities in the world.",
      "✈️ I once flew across the Atlantic to track down serial entrepreneur Simon Squibb in London because I believed in my idea that much. That gamble led to a partnership running AI bootcamps through HelpBnk.",
      "🔥 I'm building the future of AI education and proving that if you're bold enough to show up, the right people will listen.",
    ],
    tags: ["AI Squads", "UC Berkeley", "10,000+ Students", "AI Education", "HelpBnk"],
    advice:
      "I flew across the world to meet someone I'd never spoken to because I believed in what I was building. Most people would have sent an email. Sometimes the boldest move is the one nobody expects. If you believe in your idea, go all in. The worst they can say is no.",
    adviceConfirmed: true,
  },
  {
    id: "tom-mumford",
    initials: "TM",
    color: "#7C3AED",
    name: "Tom Mumford",
    role: "Co-Founder, In The Business",
    location: "United Kingdom",
    sector: "Media & Podcasting",
    bio: [
      "🎙️ I'm Tom, Co-Founder of In The Business. I host the ITB podcast and interview series, chatting with some of the UK's coolest entrepreneurs including Jonny Wilkinson, Richard Harpin and Simon Woodroffe.",
      "📱 We built a content page that gets over 500k views a month on Instagram alone, and now help founders and brands build their presence online.",
      "🔥 We run live events, founder summits and roundtable dinners that put ambitious people in a room together, because that's where the real magic happens.",
    ],
    tags: ["In The Business", "ITB Podcast", "500k+ Monthly Views", "Founder Events", "Content Creator"],
    advice:
      "I've sat across from hundreds of founders and every single one of them started with nothing but an idea and the nerve to try. Nobody had it figured out on day one. Just start talking to people, put yourself out there, and the rest will follow.",
    adviceConfirmed: true,
  },
];

/**
 * Photo paths.
 *
 * Both come out of the LinkedIn banner composites in the original profile
 * cards: the banner is the full 760x200 image, and the avatar is the circular
 * profile photo cropped out of its left-hand side. Filenames match `id`, so
 * these are derived rather than stored on every entry.
 */
export function ambassadorAvatar(id: string): string {
  return `/ambassadors/avatars/${id}.jpg`;
}

export function ambassadorBanner(id: string): string {
  return `/ambassadors/${id}.jpg`;
}
