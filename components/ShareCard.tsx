"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import GradientButton from "@/components/ui/GradientButton";

interface ShareCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  stat?: string;
  accent?: "pink" | "sky" | "purple" | "yellow" | "green";
  filename?: string;
}

const ACCENT_GRADIENT: Record<NonNullable<ShareCardProps["accent"]>, string> = {
  pink: "linear-gradient(135deg, #ff6b9d, #a78bfa)",
  sky: "linear-gradient(135deg, #38bdf8, #a78bfa)",
  purple: "linear-gradient(135deg, #a78bfa, #ff6b9d)",
  yellow: "linear-gradient(135deg, #f5c518, #f97316)",
  green: "linear-gradient(135deg, #4ade80, #38bdf8)",
};

export default function ShareCard({
  emoji,
  title,
  subtitle,
  stat,
  accent = "pink",
  filename = "linky101-share",
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    if (!cardRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0f172a", scale: 2 });

      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const file = new File([blob], `${filename}.png`, { type: "image/png" });

          if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
            try {
              await navigator.share({ files: [file], title, text: subtitle });
              resolve();
              return;
            } catch {
              // user cancelled or unsupported — fall through to download
            }
          }

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        }, "image/png");
      });
    } catch {
      setError("Couldn't create the image — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={cardRef}
        className="w-full max-w-xs overflow-hidden rounded-[22px] border-4 border-white/20 p-6 text-center"
        style={{ background: ACCENT_GRADIENT[accent] }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">LinkY101</p>
        <p className="mt-3 text-5xl">{emoji}</p>
        <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
        <p className="mt-1 text-sm font-bold text-white/90">{subtitle}</p>
        {stat && (
          <p className="mt-3 rounded-full border-2 border-white/40 bg-black/15 px-4 py-1.5 text-lg font-black text-white">
            {stat}
          </p>
        )}
      </div>

      {error && <p className="text-xs font-bold text-orange">{error}</p>}

      <GradientButton variant={accent} size="sm" className="w-full max-w-xs" disabled={busy} onClick={handleShare}>
        <span className="flex items-center justify-center gap-2">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
            <Share2 className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {busy ? "Creating..." : "Share"}
        </span>
      </GradientButton>
    </div>
  );
}
