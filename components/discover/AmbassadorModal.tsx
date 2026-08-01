"use client";

import { Lightbulb, X, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { ambassadorAvatar, ambassadorBanner, type Ambassador } from "@/lib/ambassadors";

export default function AmbassadorModal({ a, onClose }: { a: Ambassador; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
      >
        <div
          className="relative bg-cover bg-center p-6 text-center"
          style={{ backgroundImage: `url(${ambassadorBanner(a.id)})` }}
        >
          {/* Their own LinkedIn banner, dimmed so the name stays readable */}
          <div className="absolute inset-0 bg-[#1E1B4B]/65" />
          <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <span
            className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/60 text-2xl font-extrabold text-white"
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
          <p className="mt-3 text-xl font-extrabold text-white">{a.name}</p>
          <p className="text-sm font-semibold text-white/85">{a.role}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-white/70">
            <MapPin className="h-3 w-3" strokeWidth={2.5} />
            {a.location}
          </p>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#EC4899]">About</p>
          {a.bio.map((para, i) => (
            <p key={i} className="mb-2 text-sm leading-relaxed text-gray-600">
              {para}
            </p>
          ))}

          <p className="mb-2 mt-4 text-[10px] font-extrabold uppercase tracking-wider text-[#EC4899]">
            Known for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {a.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-bold text-[#5B21B6]">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] p-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#92400E]">
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.5} />
              One piece of advice
            </p>
            {a.adviceConfirmed ? (
              <p className="text-sm font-semibold italic leading-relaxed text-[#78350F]">
                &ldquo;{a.advice}&rdquo;
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-[#92400E]/70">
                Coming soon — we&apos;re waiting on {a.name.split(" ")[0]}&apos;s own words for the next
                generation.
              </p>
            )}
          </div>

          {a.linkedin && (
            <a
              href={a.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-600"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
              Connect on LinkedIn
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
