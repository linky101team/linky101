import Link from "next/link";

interface SectionTitleProps {
  emoji?: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export default function SectionTitle({
  emoji,
  title,
  actionLabel,
  actionHref,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="flex items-center gap-2 font-black uppercase tracking-wide text-ink">
        {emoji && <span>{emoji}</span>}
        <span>{title}</span>
      </h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-xs font-black uppercase tracking-wide text-sky"
        >
          {actionLabel} &rsaquo;
        </Link>
      )}
    </div>
  );
}
