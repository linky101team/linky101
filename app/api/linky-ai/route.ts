import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getFallbackResponse } from "@/lib/linkyAiFallback";

const MESSAGE_MAX = 500;
const FREE_DAILY_LIMIT = 20;
const PREMIUM_DAILY_LIMIT = 50;
const HISTORY_LIMIT = 20;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

function buildSystemPrompt(profile: {
  first_name: string;
  level: number;
  interests: string[];
  current_streak: number;
}): string {
  return [
    "You are Linky, the friendly in-app assistant for LinkY101, a gamified networking and entrepreneurship platform for young people aged 13-18.",
    "You help with business/entrepreneurship questions (starting a business, marketing, money, leadership) and questions about how the LinkY101 app works (levels, XP, LinkCoins, streaks, quizzes, mentors, teams, the shop).",
    "Keep replies short (2-4 sentences), encouraging, age-appropriate, and safe. Never discuss anything unsafe, inappropriate, or unrelated to business/the platform — politely redirect instead.",
    "Never ask for or reference personal contact information, passwords, or financial account details.",
    `You're talking to ${profile.first_name}, who is Level ${profile.level} with a ${profile.current_streak}-day streak.` +
      (profile.interests.length > 0 ? ` Their interests include: ${profile.interests.join(", ")}.` : ""),
  ].join(" ");
}

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawMessage = typeof body?.message === "string" ? body.message : "";
  const message = rawMessage.trim().slice(0, MESSAGE_MAX);
  if (!message) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, level, interests, current_streak, is_premium")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: chatRow } = await supabase
    .from("ai_chats")
    .select("id, messages")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingMessages: ChatMessage[] = (chatRow?.messages as ChatMessage[] | null) ?? [];

  const dayAgo = Date.now() - 24 * 60 * 60_000;
  const sentToday = existingMessages.filter((m) => m.role === "user" && new Date(m.at).getTime() > dayAgo).length;
  const limit = profile.is_premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  if (sentToday >= limit) {
    return NextResponse.json(
      { error: `You've hit today's chat limit (${limit} messages). Try again tomorrow!` },
      { status: 429 }
    );
  }

  const userMessage: ChatMessage = { role: "user", content: message, at: new Date().toISOString() };
  let replyText: string;

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const recentHistory = existingMessages.slice(-HISTORY_LIMIT).map((m) => ({ role: m.role, content: m.content }));
      const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: buildSystemPrompt(profile) },
            ...recentHistory,
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!completionResponse.ok) throw new Error(`OpenAI error ${completionResponse.status}`);
      const completion = await completionResponse.json();
      replyText = completion.choices?.[0]?.message?.content?.trim() || getFallbackResponse(message);
    } catch {
      replyText = getFallbackResponse(message);
    }
  } else {
    replyText = getFallbackResponse(message);
  }

  const assistantMessage: ChatMessage = { role: "assistant", content: replyText, at: new Date().toISOString() };
  const updatedMessages = [...existingMessages, userMessage, assistantMessage].slice(-200);

  await supabase.from("ai_chats").upsert(
    { user_id: user.id, messages: updatedMessages, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ reply: replyText, remaining: Math.max(0, limit - sentToday - 1) });
}
