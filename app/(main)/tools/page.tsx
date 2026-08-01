"use client";

import { useState } from "react";
import { Check, Lightbulb, Mic2, RotateCcw, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { validateIdea, type Validation } from "@/lib/ideaValidator";

const PITCH_STEPS = [
  {
    key: "name" as const,
    label: "What's it called?",
    placeholder: "e.g. EcoThreads",
    multiline: false,
    hint: "Even a working name is fine — you can change it later.",
  },
  {
    key: "problem" as const,
    label: "What problem does it solve?",
    placeholder: "e.g. Teens want sustainable clothes but everything affordable is fast fashion...",
    multiline: true,
    hint: "Start with what's annoying or broken right now.",
  },
  {
    key: "solution" as const,
    label: "What's your solution?",
    placeholder: "e.g. A subscription box of curated second-hand clothing for teenagers...",
    multiline: true,
    hint: "Explain it like you're telling a friend.",
  },
  {
    key: "audience" as const,
    label: "Who's it for?",
    placeholder: "e.g. 14-19 year olds who care about sustainability",
    multiline: false,
    hint: "Be specific. 'Everyone' is not an audience.",
  },
  {
    key: "ask" as const,
    label: "What do you need?",
    placeholder: "e.g. £500 to buy initial stock, and a mentor who knows retail",
    multiline: true,
    hint: "Money, advice, introductions — what would move this forward?",
  },
];

type PitchKey = (typeof PITCH_STEPS)[number]["key"];
type PitchData = Record<PitchKey, string>;

const EMPTY_PITCH: PitchData = { name: "", problem: "", solution: "", audience: "", ask: "" };

const DECK_SECTIONS: { key: PitchKey; icon: string; label: string }[] = [
  { key: "problem", icon: "🔥", label: "The Problem" },
  { key: "solution", icon: "💡", label: "The Solution" },
  { key: "audience", icon: "🎯", label: "Who It's For" },
  { key: "ask", icon: "🤝", label: "The Ask" },
];

function scoreColor(score: number): string {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EC4899";
}

export default function ToolsPage() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<Validation | null>(null);

  const [step, setStep] = useState(0);
  const [pitch, setPitch] = useState<PitchData>(EMPTY_PITCH);
  const [showDeck, setShowDeck] = useState(false);

  const current = PITCH_STEPS[step];
  const canAdvance = pitch[current.key].trim().length > 0;
  const isLastStep = step === PITCH_STEPS.length - 1;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Founder Tools 🛠️</h1>
          <p className="text-sm text-gray-500">Free tools to get you from idea to pitch</p>
        </div>
      </Reveal>

      {/* ---------------- Idea Validator ---------------- */}
      <Reveal index={1}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#F59E0B]" strokeWidth={2.5} />
            <h2 className="text-lg font-extrabold text-[#1E1B4B]">Idea Validator</h2>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            Describe your idea and get scored against what actually makes a business work.
          </p>

          <textarea
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              setResult(null);
            }}
            placeholder="Describe your business idea — what it is, who it's for, and how it makes money..."
            className="h-28 w-full resize-none rounded-xl border-2 border-[#EDE9FE] p-3 text-sm text-[#1E1B4B] outline-none focus:border-[#7C3AED]"
          />
          <button
            type="button"
            onClick={() => setResult(validateIdea(idea))}
            disabled={idea.trim().length < 10}
            className="grad-cool mt-3 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
          >
            Validate my idea 🔍
          </button>

          {result && (
            <div className="mt-5">
              <div className="mb-4 flex flex-col gap-2.5">
                {result.criteria.map((c) => (
                  <div key={c.key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[#1E1B4B]">
                        {c.hit && <Check className="h-3.5 w-3.5 text-[#10B981]" strokeWidth={3} />}
                        {c.label}
                      </span>
                      <span className="text-sm font-extrabold" style={{ color: scoreColor(c.score) }}>
                        {c.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${c.score}%`, backgroundColor: scoreColor(c.score) }}
                      />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{c.tip}</p>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: result.overall >= 75 ? "#F0FDF4" : "#FEF3C7" }}
              >
                <p className="text-3xl font-extrabold" style={{ color: scoreColor(result.overall) }}>
                  {result.overall}%
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-[#1E1B4B]">{result.verdict}</p>
              </div>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
                Scored against a fixed checklist, not an opinion — the same idea always gets the same score.
                It&apos;s a starting point, not a verdict.
              </p>
            </div>
          )}
        </div>
      </Reveal>

      {/* ---------------- Pitch Deck Creator ---------------- */}
      <Reveal index={2}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-[#EC4899]" strokeWidth={2.5} />
            <h2 className="text-lg font-extrabold text-[#1E1B4B]">Pitch Deck Creator</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            Five questions and you&apos;ve got a pitch you could actually present.
          </p>

          {!showDeck ? (
            <>
              <div className="mb-4 flex gap-1.5">
                {PITCH_STEPS.map((s, i) => (
                  <div
                    key={s.key}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= step ? "grad-brand" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#7C3AED]">
                Step {step + 1} of {PITCH_STEPS.length}
              </p>
              <label className="mb-2 block text-base font-extrabold text-[#1E1B4B]">{current.label}</label>

              {current.multiline ? (
                <textarea
                  value={pitch[current.key]}
                  onChange={(e) => setPitch({ ...pitch, [current.key]: e.target.value })}
                  placeholder={current.placeholder}
                  className="h-24 w-full resize-none rounded-xl border-2 border-[#EDE9FE] p-3 text-sm text-[#1E1B4B] outline-none focus:border-[#7C3AED]"
                />
              ) : (
                <input
                  value={pitch[current.key]}
                  onChange={(e) => setPitch({ ...pitch, [current.key]: e.target.value })}
                  placeholder={current.placeholder}
                  className="w-full rounded-xl border-2 border-[#EDE9FE] p-3 text-sm text-[#1E1B4B] outline-none focus:border-[#7C3AED]"
                />
              )}
              <p className="mt-1.5 text-xs text-gray-400">{current.hint}</p>

              <div className="mt-4 flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-500 transition-transform active:scale-95"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (isLastStep ? setShowDeck(true) : setStep(step + 1))}
                  disabled={!canAdvance}
                  className="grad-brand flex-1 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
                >
                  {isLastStep ? "Generate my pitch 🎤" : "Next →"}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-[#1E1B4B] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Your pitch deck</p>
              <h3 className="text-grad mt-1 text-2xl font-extrabold">{pitch.name || "Your Business"}</h3>

              <div className="mt-4 flex flex-col gap-3">
                {DECK_SECTIONS.map((s) => (
                  <div key={s.key} className="rounded-xl bg-white/10 p-3.5">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#C084FC]">
                      {s.icon} {s.label}
                    </p>
                    <p className="text-sm leading-relaxed text-white/90">{pitch[s.key] || "—"}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeck(false);
                    setStep(0);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-95"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                  Edit answers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPitch(EMPTY_PITCH);
                    setStep(0);
                    setShowDeck(false);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white/80 transition-transform active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
