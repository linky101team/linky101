"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { AMBASSADORS, ambassadorAvatar, type Ambassador } from "@/lib/ambassadors";
import { Reveal, LiftCard } from "@/components/ui/Reveal";
import AmbassadorModal from "@/components/discover/AmbassadorModal";

interface AmbassadorGridProps {
  /** Cap the number shown (e.g. a preview on Discover). Omit to show all. */
  limit?: number;
  /** Hide the filter chips — useful for a short preview row. */
  showFilters?: boolean;
  onSelect?: (ambassador: Ambassador) => void;
}

export default function AmbassadorGrid({
  limit,
  showFilters = true,
  onSelect,
}: AmbassadorGridProps) {
  const [filter, setFilter] = useState("All");
  // The grid owns the profile modal so "View profile" works everywhere it is
  // used, not only where a parent happened to pass a handler.
  const [selected, setSelected] = useState<Ambassador | null>(null);

  // Only offer filters that actually match somebody, so no chip leads to an
  // empty grid.
  const filters = useMemo(() => {
    const sectors = Array.from(new Set(AMBASSADORS.map((a) => a.sector)));
    const regions = Array.from(
      new Set(AMBASSADORS.map((a) => a.region).filter((r): r is string => !!r))
    );
    return ["All", ...sectors, ...regions];
  }, []);

  const visible = useMemo(() => {
    const matched =
      filter === "All"
        ? AMBASSADORS
        : AMBASSADORS.filter((a) => a.sector === filter || a.region === filter);
    return limit ? matched.slice(0, limit) : matched;
  }, [filter, limit]);

  return (
    <div>
      {showFilters && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                filter === f
                  ? "grad-brand border-transparent text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a, i) => (
          <Reveal key={a.id} index={i}>
            <LiftCard>
              <div className="flex h-full flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                {/* Real photo, cropped from the LinkedIn banner they supplied.
                    Initials only ever show if the image fails to load. */}
                <span
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-lg font-extrabold text-white ring-2 ring-white"
                  style={{ backgroundColor: a.color }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ambassadorAvatar(a.id)}
                    alt={a.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </span>

                <p className="mt-3 text-base font-extrabold leading-tight text-[#1E1B4B]">{a.name}</p>

                <span className="mt-1.5 rounded-full bg-[#F3E8FF] px-3 py-1 text-[11px] font-bold text-[#7C3AED]">
                  ⭐ Founding Ambassador
                </span>

                <p className="mt-2 text-xs font-semibold text-gray-500">{a.role}</p>

                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-gray-500">
                  {a.bio[0]}
                </p>

                <span className="mt-3 flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-bold text-[#92400E]">
                  <MapPin className="h-3 w-3" strokeWidth={2.5} />
                  {a.region ?? a.location}
                </span>

                {/*
                  Deliberately "View profile", never "Connect" or "Message".
                  Ambassadors are not DBS-checked and there is no private
                  contact between them and under-18s anywhere in this product.
                */}
                <button
                  type="button"
                  onClick={() => (onSelect ? onSelect(a) : setSelected(a))}
                  className="mt-4 w-full rounded-full border-2 border-[#1E1B4B] py-2.5 text-sm font-extrabold text-[#1E1B4B] transition-colors hover:bg-[#1E1B4B] hover:text-white"
                >
                  View profile →
                </button>
              </div>
            </LiftCard>
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[#7C3AED]" strokeWidth={1.75} />
          <p className="mt-2 font-bold text-[#1E1B4B]">Nobody here yet</p>
          <p className="text-sm text-gray-500">Try another filter.</p>
        </div>
      )}

      <AnimatePresence>
        {selected && <AmbassadorModal a={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
