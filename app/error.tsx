"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy p-6 text-center">
      <span className="text-6xl">😵</span>
      <h1 className="heading-game text-2xl">Something Went Wrong</h1>
      <p className="max-w-xs text-sm font-bold text-text-muted">
        We hit a snag loading this page. Try again — if it keeps happening, let us know via Help &amp; Feedback.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-2xl border-3 border-pink bg-gradient-pink-purple px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-glow-pink"
      >
        Try Again
      </button>
    </div>
  );
}
