import type { HTMLAttributes, ReactNode } from "react";

export type GameCardColor = string;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** @deprecated kept for backward compat — ignored */
  borderColor?: string;
  /** @deprecated kept for backward compat — ignored */
  glowColor?: string;
}

export default function GameCard({
  children,
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  borderColor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glowColor,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
