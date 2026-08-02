"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const SECTIONS = [
  { href: "/admin", label: "Overview", emoji: "📊" },
  { href: "/admin/users", label: "Users", emoji: "👤" },
  { href: "/admin/moderation", label: "Moderation", emoji: "🛡️" },
  { href: "/admin/feedback", label: "Feedback", emoji: "💬" },
  { href: "/admin/analytics", label: "Analytics", emoji: "📈" },
  { href: "/admin/podcasts", label: "Podcasts", emoji: "🎧" },
  { href: "/admin/lessons", label: "Lessons", emoji: "📚" },
  { href: "/admin/quizzes", label: "Quizzes", emoji: "🧠" },
  { href: "/admin/opportunities", label: "Opportunities", emoji: "🎯" },
  { href: "/admin/mentors", label: "Mentors", emoji: "🤝" },
  { href: "/admin/questions", label: "Questions", emoji: "❓" },
  { href: "/admin/shop", label: "Shop", emoji: "🛍️" },
  { href: "/admin/faq", label: "FAQ", emoji: "❓" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();
  const pathname = usePathname();

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <p className="font-black uppercase text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-navy p-6 text-center">
        <span className="text-4xl">🔒</span>
        <p className="heading-game text-lg">Admins Only</p>
        <p className="text-sm font-bold text-text-muted">You don&apos;t have access to this page.</p>
        <Link href="/home" className="mt-2 text-xs font-black uppercase text-sky">
          ← Back to LinkY101
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">
      <header className="sticky top-0 z-30 border-b-3 border-border bg-card">
        <div className="mx-auto flex max-w-[900px] items-center gap-3 px-5 py-3">
          <Link href="/home" aria-label="Back to LinkY101" className="text-text-muted">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
          </Link>
          <span className="heading-game text-lg">🛠️ Admin Dashboard</span>
        </div>
        <div className="mx-auto flex max-w-[900px] gap-2 overflow-x-auto px-5 pb-3">
          {SECTIONS.map((section) => {
            const active = section.href === "/admin" ? pathname === "/admin" : pathname.startsWith(section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`shrink-0 rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                  active ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
                }`}
              >
                {section.emoji} {section.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-6">{children}</main>
    </div>
  );
}
