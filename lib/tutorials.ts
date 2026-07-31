export interface TutorialStep {
  target: string;
  title: string;
  body: string;
}

export interface Tutorial {
  id: string;
  label: string;
  emoji: string;
  steps: TutorialStep[];
}

export const TOURS: Tutorial[] = [
  {
    id: "home",
    label: "Home",
    emoji: "🏠",
    steps: [
      { target: "home-topbar", title: "Your Status Bar", body: "Your avatar, level, streak, and XP all live up here — check it any time." },
      { target: "home-roadmap", title: "Level Roadmap", body: "See what unlocks next and how much XP you need to get there." },
      { target: "home-tasks", title: "Daily Tasks", body: "Complete these each day for XP and LinkCoins — 5 tasks unlocks the daily spin." },
      { target: "home-team", title: "Your Team", body: "Your school's team challenge progress shows up right here." },
      { target: "home-spin", title: "Daily Spin", body: "Finish 2+ tasks to unlock a free spin for prizes and coins." },
      { target: "home-leaderboard", title: "Leaderboard", body: "See how you stack up against other founders on LinkY101." },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    emoji: "📚",
    steps: [
      { target: "learn-tabs", title: "Feed or Podcasts", body: "Switch between the lesson feed and podcast episodes here." },
      { target: "learn-feed", title: "Learn Feed", body: "Bite-sized lessons, tips, quotes, and polls — react to the ones you love." },
      { target: "learn-fab", title: "Submit a Lesson", body: "Once you hit Level 10, you can submit your own lessons to help others." },
      { target: "learn-tabs", title: "Podcasts", body: "Tap the Podcasts tab to listen to founder interviews and earn XP." },
      { target: "learn-feed", title: "React & Learn", body: "Reacting to lessons helps us show you more of what you find useful." },
      { target: "learn-fab", title: "You're All Set!", body: "Explore the feed and come back daily for fresh content." },
    ],
  },
  {
    id: "community",
    label: "Community",
    emoji: "👥",
    steps: [
      { target: "community-filters", title: "Browse by Category", body: "Filter posts by topic to find exactly what interests you." },
      { target: "community-feed", title: "Community Feed", body: "See wins, questions, and ideas shared by other young founders." },
      { target: "community-fab", title: "Share Something", body: "Tap here to post your own win, question, or idea." },
      { target: "community-feed", title: "Gold Posts", body: "Level 5+ members can bump their best posts to Gold for extra visibility." },
      { target: "community-feed", title: "Comments & Reactions", body: "Jump into the conversation — react and comment on posts you like." },
      { target: "community-fab", title: "Be Kind", body: "Keep it supportive — report anything that breaks the rules." },
    ],
  },
  {
    id: "discover",
    label: "Discover",
    emoji: "🔍",
    steps: [
      { target: "discover-search", title: "Search LinkY101", body: "Find founders, topics, and content across the whole platform." },
      { target: "discover-topics", title: "Browse Topics", body: "Explore content by topic — from marketing to money to leadership." },
      { target: "discover-trending", title: "Trending Now", body: "See what's popular across LinkY101 right now." },
      { target: "discover-founders", title: "Featured Founders", body: "Get inspired by standout members of the community." },
      { target: "discover-creators", title: "Creators to Follow", body: "Discover and follow founders whose content you enjoy." },
      { target: "discover-search", title: "Explore Freely", body: "There's always something new to find — check back often!" },
    ],
  },
  {
    id: "teams",
    label: "Teams",
    emoji: "🏫",
    steps: [
      { target: "teams-banner", title: "Your School Team", body: "This is your school's team — everyone here is on the same side." },
      { target: "teams-challenge", title: "Active Challenge", body: "Teams compete together on challenges for bonus rewards." },
      { target: "teams-activity", title: "Team Activity", body: "See what your teammates have been up to lately." },
      { target: "teams-leaderboard", title: "Team Leaderboard", body: "Track how your team ranks against others." },
      { target: "teams-league", title: "Inter-School League", body: "See how your whole school stacks up against other schools." },
      { target: "teams-banner", title: "Team Up!", body: "The more your team contributes, the more everyone earns." },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    emoji: "👤",
    steps: [
      { target: "profile-header", title: "Your Profile", body: "Your avatar, level, and stats — this is how others see you." },
      { target: "profile-xp", title: "XP Progress", body: "Track your progress toward the next level right here." },
      { target: "profile-dream", title: "Your Dream", body: "Add what you want to build one day — it shows on your public profile." },
      { target: "profile-interests", title: "Your Interests", body: "These help us personalise your daily tasks and content." },
      { target: "profile-shop", title: "LinkCoin Shop", body: "Spend your LinkCoins on frames, titles, banners, and more." },
      { target: "profile-settings", title: "Settings", body: "Manage your privacy, notifications, and account from here." },
    ],
  },
];
