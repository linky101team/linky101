import SectionTitle from "@/components/ui/SectionTitle";
import SearchBar from "@/components/discover/SearchBar";
import TopicsGrid from "@/components/discover/TopicsGrid";
import TrendingSection from "@/components/discover/TrendingSection";
import FeaturedFounders from "@/components/discover/FeaturedFounders";
import CreatorsRow from "@/components/discover/CreatorsRow";
import TutorialPrompt from "@/components/TutorialPrompt";

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🔍" title="Discover" />

      <div data-tour="discover-search">
        <SearchBar />
      </div>

      <div data-tour="discover-topics">
        <p className="mb-3 font-black uppercase tracking-wide text-white">🧭 Browse Topics</p>
        <TopicsGrid />
      </div>

      <div data-tour="discover-trending">
        <TrendingSection />
      </div>
      <div data-tour="discover-founders">
        <FeaturedFounders />
      </div>
      <div data-tour="discover-creators">
        <CreatorsRow />
      </div>

      <TutorialPrompt tourId="discover" />
    </div>
  );
}
