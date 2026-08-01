"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Tutorial } from "@/lib/tutorials";
import GradientButton from "@/components/ui/GradientButton";

interface SpotlightTutorialProps {
  tour: Tutorial;
  stepIndex: number;
  onNext: () => void;
  onSkip: () => void;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export default function SpotlightTutorial({ tour, stepIndex, onNext, onSkip }: SpotlightTutorialProps) {
  const [rect, setRect] = useState<Box | null>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const step = tour.steps[stepIndex];

  useEffect(() => {
    let cancelled = false;

    function measure() {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        setTooltipTop(window.innerHeight / 2 - 90);
        return;
      }
      const r = el.getBoundingClientRect();
      const box: Box = { top: r.top, left: r.left, width: r.width, height: r.height };
      setRect(box);

      const spaceBelow = window.innerHeight - (box.top + box.height);
      const top =
        spaceBelow > 220
          ? box.top + box.height + PADDING + 12
          : Math.max(16, box.top - PADDING - 200);
      setTooltipTop(top);
    }

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const settleTimer = setTimeout(measure, 320);
    measure();

    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      clearTimeout(settleTimer);
      window.removeEventListener("resize", measure);
    };
  }, [step.target]);

  return (
    <div className="fixed inset-0 z-[70]">
      {rect ? (
        <motion.div
          className="pointer-events-none absolute rounded-2xl border-[3px] border-[#FF6B6B]"
          animate={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 0 9999px rgba(15,23,42,0.85)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/85" />
      )}

      <button
        type="button"
        aria-label="Close tutorial"
        onClick={onSkip}
        className="absolute inset-0"
        style={{ pointerEvents: rect ? "none" : "auto" }}
      />

      {tooltipTop !== null && (
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-4 right-4 mx-auto max-w-[380px] rounded-[18px] border border-gray-200 bg-white p-4 shadow-xl"
          style={{ top: tooltipTop }}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#FF6B6B]">
            Step {stepIndex + 1}/{tour.steps.length}
          </p>
          <h3 className="mb-1 text-base font-bold text-gray-900">{step.title}</h3>
          <p className="mb-3 text-sm font-medium text-gray-500">{step.body}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-bold uppercase text-gray-500 transition-transform active:scale-95"
            >
              Skip
            </button>
            <GradientButton variant="pink" size="sm" className="flex-1" onClick={onNext}>
              {stepIndex + 1 === tour.steps.length ? "Done" : "Next"}
            </GradientButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
