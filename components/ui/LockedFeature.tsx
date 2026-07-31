import type { ReactNode } from "react";

interface LockedFeatureProps {
  level?: number;
  children?: ReactNode;
  [key: string]: unknown;
}

export default function LockedFeature({ children }: LockedFeatureProps) {
  // No longer locked — everything is unlocked from day one
  return <>{children}</>;
}
