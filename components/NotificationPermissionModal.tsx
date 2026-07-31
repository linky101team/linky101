"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { enablePushNotifications, isPushSupported } from "@/lib/pushClient";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

const PROMPTED_KEY = "linky101_push_prompted";
const SHOW_DELAY_MS = 1500;

interface NotificationPermissionModalProps {
  pushEnabled: boolean;
}

export default function NotificationPermissionModal({ pushEnabled }: NotificationPermissionModalProps) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "requesting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pushEnabled) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(PROMPTED_KEY) === "true") return;
    if (!isPushSupported()) return;
    if (Notification.permission !== "default") return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pushEnabled]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(PROMPTED_KEY, "true");
  }

  async function handleEnable() {
    setStatus("requesting");
    setErrorMsg(null);
    const result = await enablePushNotifications();
    if (result.success) {
      dismiss();
    } else {
      setStatus("error");
      setErrorMsg(result.reason ?? "Something went wrong.");
      localStorage.setItem(PROMPTED_KEY, "true");
    }
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xs"
        >
          <GameCard borderColor="purple" glowColor="purple" className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-purple bg-gradient-purple-pink text-white shadow-glow-purple">
              <Bell className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <h2 className="heading-game mt-3 text-lg">Stay in the Loop</h2>
            <p className="mt-1 text-sm font-bold text-text-muted">
              Turn on notifications for streak reminders, mentor answers, and community activity.
            </p>

            {errorMsg && <p className="mt-2 text-xs font-bold text-orange">{errorMsg}</p>}

            <div className="mt-4 flex flex-col gap-2">
              <GradientButton variant="purple" disabled={status === "requesting"} onClick={handleEnable}>
                {status === "requesting" ? "Requesting..." : "Enable Notifications"}
              </GradientButton>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
              >
                Not Now
              </button>
            </div>
          </GameCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
