const CATEGORIES = [
  { value: "all", label: "All", emoji: "", active: "bg-[#1A1A2E] text-white" },
  { value: "win", label: "Wins", emoji: "🏆", active: "bg-[#2ECC71] text-white" },
  { value: "question", label: "Questions", emoji: "❓", active: "bg-[#039BE5] text-white" },
  { value: "idea", label: "Ideas", emoji: "💡", active: "bg-[#FFC107] text-gray-900" },
  { value: "tip", label: "Tips", emoji: "🛠️", active: "bg-[#FF6B6B] text-white" },
  { value: "motivation", label: "Motivation", emoji: "🚀", active: "bg-[#7C3AED] text-white" },
];

interface CategoryFiltersProps {
  active: string;
  onChange: (value: string) => void;
}

export default function CategoryFilters({ active, onChange }: CategoryFiltersProps) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {CATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              isActive ? `${c.active} shadow-sm` : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {c.emoji && `${c.emoji} `}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
