"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import GradientButton from "@/components/ui/GradientButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "linky101_install_dismissed";

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  }

  async function handleInstall() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  }

  if (!visible || !deferredEvent) return null;

  return (
    <div className="fixed inset-x-0 bottom-40 z-50 mx-auto max-w-[430px] px-4 lg:hidden">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
        <img src="/icon.svg" alt="LinkY101" className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Install LinkY101</p>
          <p className="text-[11px] text-gray-500">Add to your home screen for quick access</p>
        </div>
        <GradientButton variant="dark" size="sm" onClick={handleInstall}>
          Install
        </GradientButton>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 text-text-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
