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
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with Linky AI"
          style={{ bottom: "80px", right: "16px" }}
          className="fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#039BE5] text-white shadow-lg transition-transform active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-20"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[65vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl"
            >
              <div className="flex items-center gap-3 bg-[#1A1A2E] p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Linky AI</p>
                  <p className="text-[11px] text-white/60">Your business buddy</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/70">
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="mb-3 max-w-[85%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-800">
                    Hey {profile.first_name}! I&apos;m Linky 👋 Ask me anything about business or how LinkY101 works.
                  </p>
                </div>

                {loadingHistory ? (
                  <p className="text-center text-xs font-semibold text-gray-400">Loading...</p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`mb-3 max-w-[85%] rounded-2xl p-3 text-sm ${
                        m.role === "user"
                          ? "ml-auto rounded-br-sm bg-[#039BE5] text-white"
                          : "rounded-bl-sm border border-gray-200 bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))
                )}

                {sending && (
                  <div className="mb-3 max-w-[85%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white p-3 shadow-sm">
                    <p className="text-sm text-gray-400">Linky is typing...</p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="border-t border-gray-100 bg-white px-4 py-2 text-center text-xs font-semibold text-[#FF6B6B]">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask Linky something..."
                  className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#039BE5] text-white transition-transform active:scale-90 disabled:opacity-40"
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
