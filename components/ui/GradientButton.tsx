import type { ButtonHTMLAttributes, ReactNode } from "react";

export type GradientButtonVariant = "pink" | "yellow" | "green" | "sky" | "purple";
export type GradientButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<GradientButtonVariant, string> = {
  pink: "bg-gradient-pink-purple border-pink shadow-glow-pink",
  purple: "bg-gradient-purple-pink border-purple shadow-glow-purple",
  sky: "bg-gradient-sky-purple border-sky shadow-glow-sky",
  yellow: "bg-gradient-yellow-orange border-yellow shadow-glow-yellow text-ink",
  green: "bg-gradient-green-sky border-green shadow-glow-green",
};

const SIZE_CLASSES: Record<GradientButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-xl",
  md: "px-6 py-3 text-sm rounded-2xl",
  lg: "px-8 py-4 text-base rounded-2xl",
};

interface GradientButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: GradientButtonVariant;
  size?: GradientButtonSize;
  children: ReactNode;
  className?: string;
}

export default function GradientButton({
  variant = "pink",
  size = "md",
  children,
  disabled,
  type = "button",
  className = "",
  ...rest
}: GradientButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`border-3 font-black uppercase tracking-wide text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
