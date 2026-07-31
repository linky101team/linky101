import SectionTitle from "@/components/ui/SectionTitle";
import TeamBanner from "@/components/teams/TeamBanner";
import ActiveChallengeBanner from "@/components/teams/ActiveChallengeBanner";
import TeamActivityFeed from "@/components/teams/TeamActivityFeed";
import TeamLeaderboard from "@/components/teams/TeamLeaderboard";
import InterSchoolLeague from "@/components/teams/InterSchoolLeague";
import TutorialPrompt from "@/components/TutorialPrompt";

export default function TeamsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🏫" title="Teams" />

      <div data-tour="teams-banner">
        <TeamBanner />
      </div>
      <div data-tour="teams-challenge">
        <ActiveChallengeBanner />
      </div>
      <div data-tour="teams-activity">
        <TeamActivityFeed />
      </div>
      <div data-tour="teams-leaderboard">
        <TeamLeaderboard />
      </div>
      <div data-tour="teams-league">
        <InterSchoolLeague />
      </div>

      <TutorialPrompt tourId="teams" />
    </div>
  );
}
