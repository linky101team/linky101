"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export default function LinkyChat() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !profile) return;

    supabase
      .from("ai_chats")
      .select("messages")
      .eq("user_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        setMessages((data?.messages as ChatMessage[] | null) ?? []);
        setLoadingHistory(false);
      });
  }, [open, profile, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput("");
    setErrorMsg(null);
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed, at: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/linky-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, at: new Date().toISOString() }]);
    } catch {
      setErrorMsg("Couldn't reach Linky — check your connection.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  if (!profile) return null;

  return (
    <>
      {!open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40">
          <div className="mx-auto max-w-[430px] px-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Chat with Linky AI"
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
            >
              <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[80vh] w-full max-w-[430px] flex-col rounded-t-[24px] border-3 border-b-0 border-pink bg-navy shadow-glow-pink"
            >
              <div className="flex items-center gap-3 border-b-3 border-border p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-black text-white">Linky AI</p>
                  <p className="text-[10px] font-bold text-text-muted">Your business buddy</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-text-muted">
                  <X className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                <div className="mb-3 max-w-[85%] rounded-2xl rounded-bl-sm border-3 border-purple bg-card p-3">
                  <p className="text-sm font-bold text-white">
                    Hey {profile.first_name}! I&apos;m Linky 👋 Ask me anything about business or how LinkY101 works.
                  </p>
                </div>

                {loadingHistory ? (
                  <p className="text-center text-xs font-bold text-text-muted">Loading...</p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`mb-3 max-w-[85%] rounded-2xl p-3 text-sm font-bold ${
                        m.role === "user"
                          ? "ml-auto rounded-br-sm border-3 border-pink bg-gradient-pink-purple text-white"
                          : "rounded-bl-sm border-3 border-purple bg-card text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))
                )}

                {sending && (
                  <div className="mb-3 max-w-[85%] rounded-2xl rounded-bl-sm border-3 border-purple bg-card p-3">
                    <p className="text-sm font-bold text-text-muted">Linky is typing...</p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="border-t-3 border-border px-4 py-2 text-center text-xs font-bold text-orange">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center gap-2 border-t-3 border-border p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask Linky something..."
                  className="flex-1 rounded-xl border-3 border-border bg-card px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted focus:border-pink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white shadow-glow-pink disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
