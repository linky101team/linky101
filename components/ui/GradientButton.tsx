import type { ButtonHTMLAttributes, ReactNode } from "react";

export type GradientButtonVariant = "pink" | "green" | "yellow" | "ghost-pink" | "ghost-green" | "ghost-yellow" | "sky" | "purple" | "dark";
export type GradientButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<GradientButtonVariant, string> = {
  pink: "bg-[#FF6B6B] text-white",
  green: "bg-[#2ECC71] text-white",
  yellow: "bg-[#FFD93D] text-gray-900",
  sky: "bg-[#039BE5] text-white",
  purple: "bg-[#7C3AED] text-white",
  dark: "bg-[#1A1A2E] text-white",
  "ghost-pink": "bg-transparent text-[#FF6B6B] border border-[#FF6B6B]",
  "ghost-green": "bg-transparent text-[#2ECC71] border border-[#2ECC71]",
  "ghost-yellow": "bg-transparent text-[#FFD93D] border border-[#FFD93D]",
};

const SIZE_CLASSES: Record<GradientButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-xl",
};

interface GradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
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
      className={`font-bold transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
