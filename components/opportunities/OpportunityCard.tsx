"use client";

import { Bookmark, Check } from "lucide-react";

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  category: string;
  age_min: number | null;
  age_max: number | null;
  deadline: string | null;
  link: string | null;
  location: string | null;
}

const CATEGORY_STYLE: Record<string, { border: string; glow: string; emoji: string; label: string }> = {
  competition: { border: "border-yellow", glow: "shadow-glow-yellow", emoji: "🏆", label: "Competition" },
  grant: { border: "border-green", glow: "shadow-glow-green", emoji: "💰", label: "Grant" },
  work_experience: { border: "border-sky", glow: "shadow-glow-sky", emoji: "💼", label: "Work Experience" },
  mentorship: { border: "border-purple", glow: "shadow-glow-purple", emoji: "🤝", label: "Mentorship" },
  event: { border: "border-pink", glow: "shadow-glow-pink", emoji: "📅", label: "Event" },
  resource: { border: "border-orange", glow: "shadow-glow-yellow", emoji: "📚", label: "Resource" },
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isSaved: boolean;
  hasApplied: boolean;
  onToggleSave: () => void;
  onToggleApplied: () => void;
}

export default function OpportunityCard({
  opportunity,
  isSaved,
  hasApplied,
  onToggleSave,
  onToggleApplied,
}: OpportunityCardProps) {
  const style = CATEGORY_STYLE[opportunity.category] ?? CATEGORY_STYLE.resource;
  const days = opportunity.deadline ? daysUntil(opportunity.deadline) : null;
  const closingSoon = days !== null && days >= 0 && days < 7;

  return (
    <div className={`rounded-[18px] border-3 bg-card p-4 ${style.border} ${style.glow}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border-2 ${style.border} px-2 py-0.5 text-[10px] font-black uppercase text-ink`}
        >
          {style.emoji} {style.label}
        </span>
        {closingSoon && (
          <span className="rounded-full bg-orange px-2 py-0.5 text-[10px] font-black uppercase text-ink">
            ⚡ Closing Soon
          </span>
        )}
        {hasApplied && (
          <span className="flex items-center gap-1 rounded-full border-2 border-green px-2 py-0.5 text-[10px] font-black uppercase text-green">
            <Check className="h-3 w-3" strokeWidth={4} /> Applied
          </span>
        )}
      </div>

      <h3 className="heading-game mb-1 text-base">{opportunity.title}</h3>
      {opportunity.description && (
        <p className="mb-2 line-clamp-2 text-sm font-bold text-text-muted">{opportunity.description}</p>
      )}

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-text-muted">
        {(opportunity.age_min || opportunity.age_max) && (
          <span>
            Ages {opportunity.age_min ?? "13"}–{opportunity.age_max ?? "18"}
          </span>
        )}
        {opportunity.deadline && (
          <span className={closingSoon ? "text-orange" : ""}>
            📆 {new Date(opportunity.deadline).toLocaleDateString()}
            {days !== null && days >= 0 && ` (${days}d left)`}
          </span>
        )}
        {opportunity.location && <span>📍 {opportunity.location}</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSave}
          className={`flex items-center gap-1 rounded-xl border-3 px-3 py-2 text-xs font-black uppercase ${
            isSaved ? "border-pink bg-pink/10 text-pink" : "border-border text-text-muted"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} strokeWidth={2.5} />
          Save
        </button>

        {opportunity.link && (
          <a
            href={opportunity.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border-3 border-sky bg-gradient-sky-purple py-2 text-center text-xs font-black uppercase text-white"
          >
            Learn More →
          </a>
        )}

        {isSaved && (
          <button
            type="button"
            onClick={onToggleApplied}
            className={`rounded-xl border-3 px-3 py-2 text-xs font-black uppercase ${
              hasApplied ? "border-green bg-green/10 text-green" : "border-border text-text-muted"
            }`}
          >
            {hasApplied ? "✓ Applied" : "I Applied!"}
          </button>
        )}
      </div>
    </div>
  );
}
