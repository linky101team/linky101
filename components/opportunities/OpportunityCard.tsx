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

const CATEGORY_STYLE: Record<string, { tile: string; chipBg: string; chipText: string; emoji: string; label: string }> = {
  competition: { tile: "bg-[#FFF8E1]", chipBg: "bg-[#FFF8E1]", chipText: "text-[#B8860B]", emoji: "🏆", label: "Competition" },
  grant: { tile: "bg-[#E8F5E9]", chipBg: "bg-[#E8F5E9]", chipText: "text-[#2ECC71]", emoji: "💰", label: "Grant" },
  work_experience: { tile: "bg-[#E3F2FD]", chipBg: "bg-[#E3F2FD]", chipText: "text-[#039BE5]", emoji: "💼", label: "Work Experience" },
  mentorship: { tile: "bg-[#F3E8FF]", chipBg: "bg-[#F3E8FF]", chipText: "text-[#7C3AED]", emoji: "🤝", label: "Mentorship" },
  event: { tile: "bg-[#FFF0F0]", chipBg: "bg-[#FFF0F0]", chipText: "text-[#FF6B6B]", emoji: "📅", label: "Event" },
  resource: { tile: "bg-gray-100", chipBg: "bg-gray-100", chipText: "text-gray-600", emoji: "📚", label: "Resource" },
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${style.tile}`}>
          {style.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-snug text-gray-900">{opportunity.title}</h3>
            {closingSoon && (
              <span className="shrink-0 rounded-full bg-[#FFF0F0] px-2 py-0.5 text-[10px] font-bold text-[#FF6B6B]">
                ⚡ {days === 0 ? "Closes today" : `${days}d left`}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.chipBg} ${style.chipText}`}>
              {style.label}
            </span>
            {(opportunity.age_min || opportunity.age_max) && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                Ages {opportunity.age_min ?? "13"}–{opportunity.age_max ?? "18"}
              </span>
            )}
            {opportunity.location && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                📍 {opportunity.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {opportunity.description && (
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-gray-600">{opportunity.description}</p>
      )}

      {opportunity.deadline && !closingSoon && (
        <p className="mt-1.5 text-xs font-semibold text-gray-400">
          📆 Closes {new Date(opportunity.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={isSaved ? "Unsave" : "Save"}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-90 ${
            isSaved ? "border-[#FF6B6B] bg-[#FFF0F0] text-[#FF6B6B]" : "border-gray-200 bg-white text-gray-400"
          }`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        {opportunity.link && (
          <a
            href={opportunity.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-[#1A1A2E] py-2 text-center text-sm font-bold text-white transition-transform active:scale-[0.98]"
          >
            View →
          </a>
        )}

        {isSaved && (
          <button
            type="button"
            onClick={onToggleApplied}
            className={`rounded-full border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
              hasApplied
                ? "border-[#2ECC71] bg-[#E8F5E9] text-[#2ECC71]"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {hasApplied ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" strokeWidth={3} /> Applied
              </span>
            ) : (
              "I applied!"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
