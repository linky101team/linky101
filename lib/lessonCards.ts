/**
 * Turns stored lesson JSON into a deck of tap-through cards.
 *
 * Research on how Duolingo, Brilliant, Imprint and Sololearn structure a
 * lesson is unanimous on one thing: nobody scrolls a wall of prose. One idea
 * per screen, ~60 words maximum, an interaction at least every third card,
 * and a visible progress bar. This module does that conversion at runtime, so
 * every existing lesson gets the new format without any content being rewritten.
 *
 * Quiz questions are interleaved between sections rather than dumped at the end
 * — asking before explaining is what keeps attention (and is better for recall
 * than reading then testing).
 */

export interface LessonSection {
  heading: string;
  body: string;
}

export interface LessonTakeaway {
  color: "yellow" | "mint" | "coral";
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LessonContent {
  intro: string;
  sections: LessonSection[];
  takeaways?: LessonTakeaway[];
  quiz: QuizQuestion[];
}

export type Card =
  | { kind: "intro"; title: string; emoji: string; body: string }
  | { kind: "text"; heading?: string; body: string }
  | { kind: "takeaway"; body: string; color: LessonTakeaway["color"] }
  | { kind: "quiz"; question: QuizQuestion; quizIndex: number };

/** Max words on a single card. Anything longer gets split at a sentence boundary. */
const MAX_WORDS = 60;

/**
 * Splits a paragraph into chunks of at most MAX_WORDS, breaking on sentence
 * ends so a card never stops mid-thought.
 */
function chunk(body: string): string[] {
  const sentences = body.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [body];
  const out: string[] = [];
  let current = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.split(/\s+/).length > MAX_WORDS && current) {
      out.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) out.push(current);
  return out.length > 0 ? out : [body];
}

export function buildCards(content: LessonContent, title: string, emoji: string): Card[] {
  const cards: Card[] = [];

  if (content.intro?.trim()) {
    cards.push({ kind: "intro", title, emoji, body: content.intro.trim() });
  }

  const quiz = content.quiz ?? [];
  let quizUsed = 0;

  // Spread the quiz questions evenly through the sections instead of stacking
  // them at the end, so there's an interaction roughly every third card.
  const sections = content.sections ?? [];
  const gap = quiz.length > 0 ? Math.max(1, Math.ceil(sections.length / quiz.length)) : Infinity;

  sections.forEach((section, i) => {
    const parts = chunk(section.body ?? "");
    parts.forEach((part, partIndex) => {
      cards.push({
        kind: "text",
        // Only the first card of a section carries the heading — the rest are
        // continuations and a repeated heading reads as a mistake.
        heading: partIndex === 0 ? section.heading : undefined,
        body: part,
      });
    });

    const shouldAsk = (i + 1) % gap === 0 && quizUsed < quiz.length && i < sections.length - 1;
    if (shouldAsk) {
      cards.push({ kind: "quiz", question: quiz[quizUsed], quizIndex: quizUsed });
      quizUsed += 1;
    }
  });

  for (const takeaway of content.takeaways ?? []) {
    cards.push({ kind: "takeaway", body: takeaway.text, color: takeaway.color });
  }

  // Anything left over runs at the end.
  while (quizUsed < quiz.length) {
    cards.push({ kind: "quiz", question: quiz[quizUsed], quizIndex: quizUsed });
    quizUsed += 1;
  }

  return cards;
}

export function countQuizCards(cards: Card[]): number {
  return cards.filter((c) => c.kind === "quiz").length;
}
