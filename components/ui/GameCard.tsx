import type { HTMLAttributes, ReactNode } from "react";

export type GameCardColor =
  | "border"
  | "pink"
  | "sky"
  | "purple"
  | "yellow"
  | "green"
  | "orange";

const BORDER_CLASSES: Record<GameCardColor, string> = {
  border: "border-border",
  pink: "border-pink",
  sky: "border-sky",
  purple: "border-purple",
  yellow: "border-yellow",
  green: "border-green",
  orange: "border-orange",
};

const GLOW_CLASSES: Record<Exclude<GameCardColor, "border" | "orange">, string> = {
  pink: "shadow-glow-pink",
  sky: "shadow-glow-sky",
  purple: "shadow-glow-purple",
  yellow: "shadow-glow-yellow",
  green: "shadow-glow-green",
};

interface GameCardProps extends HTMLAttributes<HTMLDivElement> {
  borderColor?: GameCardColor;
  glowColor?: GameCardColor;
  children: ReactNode;
}

export default function GameCard({
  borderColor = "border",
  glowColor,
  children,
  className = "",
  ...rest
}: GameCardProps) {
  const glowClass =
    glowColor && glowColor !== "border" && glowColor !== "orange"
      ? GLOW_CLASSES[glowColor]
      : "";

  return (
    <div
      className={`rounded-[18px] border-3 bg-card p-4 ${BORDER_CLASSES[borderColor]} ${glowClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
