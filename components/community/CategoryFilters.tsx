const CATEGORIES = [
  { value: "all", label: "All", emoji: "" },
  { value: "win", label: "Wins", emoji: "🏆" },
  { value: "question", label: "Questions", emoji: "❓" },
  { value: "idea", label: "Ideas", emoji: "💡" },
  { value: "tip", label: "Tips", emoji: "🛠️" },
  { value: "motivation", label: "Motivation", emoji: "🚀" },
];

interface CategoryFiltersProps {
  active: string;
  onChange: (value: string) => void;
}

export default function CategoryFilters({ active, onChange }: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`shrink-0 whitespace-nowrap rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
              isActive
                ? "border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
                : "border-border bg-card text-text-muted"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        );
      })}
    </div>
  );
}
