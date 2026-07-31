import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy p-6 text-center">
      <span className="text-6xl">🧭</span>
      <h1 className="heading-game text-2xl">Page Not Found</h1>
      <p className="max-w-xs text-sm font-bold text-text-muted">
        This page doesn&apos;t exist — it might have moved, or the link might be broken.
      </p>
      <Link
        href="/home"
        className="mt-2 rounded-2xl border-3 border-pink bg-gradient-pink-purple px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-glow-pink"
      >
        Back to LinkY101
      </Link>
    </div>
  );
}
