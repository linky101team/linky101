"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, ShieldCheck, X } from "lucide-react";
import { Reveal, LiftCard } from "@/components/ui/Reveal";
import type { Mentor } from "./MentorCard";

/**
 * Mentors are DBS-checked adults. Unlike ambassadors they are shown with a
 * verification badge, because that badge is the thing a parent or a school's
 * safeguarding lead will look for first.
 *
 * There is deliberately no "Message" or "Connect" here either. Questions go
 * through the public queue on the Mentors page and get answered openly — a
 * private channel between an adult and an under-18 is not something this
 * product has, by design.
 */
interface MentorGridProps {
  mentors: Mentor[];
}

/** Extra fields the mentors table carries that the shared Mentor type predates. */
type MentorDetail = Mentor & {
  headline?: string | null;
  location?: string | null;
  welcome_message?: string | null;
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MentorGrid({ mentors }: MentorGridProps) {
  const [selected, setSelected] = useState<MentorDetail | null>(null);

  if (mentors.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-8 w-8 text-[#10B981]" strokeWidth={1.75} />
        <p className="mt-2 font-bold text-[#1E1B4B]">Mentors coming soon</p>
        <p className="text-sm text-gray-500">Verified adults you can ask anything.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(mentors as MentorDetail[]).map((m, i) => (
          <Reveal key={m.id} index={i} className="h-full">
            <LiftCard className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#10B981] text-lg font-extrabold text-white ring-2 ring-[#10B981]/30">
                  {m.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.avatar_url}
                      alt={m.display_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    initials(m.display_name)
                  )}
                </span>

                <p className="mt-3 text-base font-extrabold leading-tight text-[#1E1B4B]">
                  {m.display_name}
                </p>

                {m.is_verified && (
                  <span className="mt-1.5 flex items-center gap-1 rounded-full bg-[#D1FAE5] px-3 py-1 text-[11px] font-bold text-[#047857]">
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                    DBS Checked Mentor
                  </span>
                )}

                {m.headline && (
                  <p className="mt-2 text-xs font-semibold text-gray-500">{m.headline}</p>
                )}

                {m.bio && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500">
                    {m.bio.split("\n")[0]}
                  </p>
                )}

                {m.location && (
                  <span className="mb-4 mt-3 flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-bold text-[#92400E]">
                    <MapPin className="h-3 w-3" strokeWidth={2.5} />
                    {m.location}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(m)}
                  className="mt-auto w-full rounded-full border-2 border-[#1E1B4B] pt-2.5 pb-2.5 text-sm font-extrabold text-[#1E1B4B] transition-colors hover:bg-[#1E1B4B] hover:text-white"
                >
                  View profile →
                </button>
              </div>
            </LiftCard>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
            >
              <div className="relative bg-[#064E3B] px-6 pb-6 pt-8 text-center">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="absolute right-4 top-4 text-white/70"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>

                <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#10B981] text-xl font-extrabold text-white ring-4 ring-[#10B981]/40">
                  {selected.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selected.avatar_url}
                      alt={selected.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(selected.display_name)
                  )}
                </span>

                <p className="mt-3 text-xl font-extrabold text-white">{selected.display_name}</p>
                {selected.headline && (
                  <p className="mt-0.5 text-sm font-semibold text-[#6EE7B7]">{selected.headline}</p>
                )}
                {selected.location && (
                  <p className="mt-0.5 text-xs text-white/60">{selected.location}</p>
                )}
                {selected.is_verified && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#10B981] bg-[#10B981]/15 px-3 py-1 text-[11px] font-bold text-[#6EE7B7]">
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                    DBS CHECKED
                  </span>
                )}
              </div>

              <div className="px-6 py-5">
                {selected.bio && (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#047857]">
                      About me
                    </p>
                    <div className="mt-2 flex flex-col gap-3">
                      {selected.bio.split("\n").filter(Boolean).map((para, i) => (
                        <p key={i} className="text-sm leading-relaxed text-gray-600">
                          {para}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {selected.expertise.length > 0 && (
                  <>
                    <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-[#047857]">
                      Ask me about
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.expertise.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#10B981] px-3 py-1 text-xs font-semibold text-[#065F46]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {selected.welcome_message && (
                  <div className="mt-5 rounded-2xl bg-[#064E3B] p-4">
                    <p className="text-lg leading-none">👋</p>
                    <p className="mt-1.5 text-sm italic leading-relaxed text-white">
                      {selected.welcome_message}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-[#6EE7B7]">
                      — {selected.display_name}
                    </p>
                  </div>
                )}

                {/*
                  Points at the public question queue, not at the mentor.
                  Everything asked here is answered openly, so there is never a
                  private thread between an adult and a member.
                */}
                <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-center text-xs leading-relaxed text-gray-500">
                  Got something to ask {selected.display_name.split(" ")[0]}? Post it below with
                  <strong className="text-[#1E1B4B]"> Ask a question</strong> — the best ones get
                  answered publicly every week.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
