/**
 * Heuristic content filter — NOT a real ML/AI model. It's a fast,
 * dependency-free first line of defence (regex + keyword lists) meant to
 * catch the obvious, common cases before a post/comment/question ever
 * reaches the database. It will miss cleverly-obfuscated content and can
 * false-positive on edge cases; the report pipeline (components/ReportButton
 * + the admin dashboard) is the backstop for everything this misses.
 */

export interface ModerationResult {
  approved: boolean;
  flagged: boolean;
  reason?: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d[\d\-.\s()]{7,}\d)/;
const ADDRESS_REGEX =
  /\b\d{1,5}\s+[a-z0-9'.\s]{2,25}\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct)\b/i;
const SOCIAL_HANDLE_REGEX =
  /\b(insta(gram)?|snap(chat)?|tiktok|discord|whatsapp|kik|telegram|onlyfans)\b[\s:]*@?[\w.]{2,}|(?<!\S)@[a-zA-Z0-9_]{3,}/i;

const SELF_HARM_KEYWORDS = [
  "kill myself",
  "suicide",
  "self harm",
  "self-harm",
  "cutting myself",
  "want to die",
  "end my life",
  "hurt myself",
];

const BULLYING_KEYWORDS = [
  "kill yourself",
  "kys",
  "you're worthless",
  "youre worthless",
  "nobody likes you",
  "everyone hates you",
  "you should die",
];

// A small, representative set — intentionally not exhaustive. Real profanity
// filtering in production should use a maintained list or vendor service.
const PROFANITY_WORDS = ["fuck", "shit", "bitch", "asshole", "bastard", "slut", "whore", "cunt"];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsAny(text: string, words: string[]): boolean {
  return words.some((w) => new RegExp(`\\b${escapeRegExp(w)}\\b`, "i").test(text));
}

function isExcessiveCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^A-Z]/g, "");
  return upper.length / letters.length > 0.7;
}

function hasSuspiciousPatterns(text: string): boolean {
  if (/(.)\1{4,}/.test(text)) return true; // same character repeated 5+ times
  if (/[!?]{4,}/.test(text)) return true; // "!!!!" style spam
  return false;
}

/** Runs before every post, comment, question, dream, and headline is saved. */
export function moderateContent(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) return { approved: true, flagged: false };

  const lower = trimmed.toLowerCase();

  if (EMAIL_REGEX.test(trimmed)) {
    return {
      approved: false,
      flagged: true,
      reason: "Looks like it contains an email address — for your safety, don't share contact info.",
    };
  }
  if (PHONE_REGEX.test(trimmed)) {
    return {
      approved: false,
      flagged: true,
      reason: "Looks like it contains a phone number — for your safety, don't share contact info.",
    };
  }
  if (ADDRESS_REGEX.test(lower)) {
    return {
      approved: false,
      flagged: true,
      reason: "Looks like it contains a home address — for your safety, don't share your location.",
    };
  }
  if (SOCIAL_HANDLE_REGEX.test(trimmed)) {
    return {
      approved: false,
      flagged: true,
      reason: "Looks like it contains a social media handle — keep the conversation here on LinkY101.",
    };
  }
  if (containsAny(lower, SELF_HARM_KEYWORDS)) {
    // LinkY101 is not a support service and deliberately does not try to be:
    // this never reaches a mentor and is never published. But declining in
    // silence is not good enough on a platform used by 13-19 year olds, so
    // the refusal names people whose actual job this is. Keep it short and
    // undramatic — a wall of concern makes people close the tab.
    return {
      approved: false,
      flagged: true,
      reason:
        "We can't help with this one, sorry — it's not what LinkY101 is for. Please talk to someone who can: Childline on 0800 1111, or text SHOUT to 85258. Both are free and open right now.",
    };
  }
  if (containsAny(lower, BULLYING_KEYWORDS)) {
    return {
      approved: false,
      flagged: true,
      reason: "This could be hurtful to someone else — let's keep LinkY101 a supportive space.",
    };
  }
  if (containsAny(lower, PROFANITY_WORDS)) {
    return { approved: false, flagged: true, reason: "This contains language that isn't allowed here." };
  }

  const flagged = isExcessiveCaps(trimmed) || hasSuspiciousPatterns(lower);
  return { approved: true, flagged };
}
