"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { answerQuestion, updateMentorProfile } from "@/lib/actions/mentors";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import { Star, Upload } from "lucide-react";

const ANSWER_MAX = 2000;
const BIO_MAX = 300;

interface MentorProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  rating_avg: number;
  rating_count: number;
}

interface PendingQuestion {
  id: string;
  question_text: string;
  asked_by: string;
  mentor_id: string | null;
  created_at: string;
  asker: { first_name: string } | null;
}

interface AnsweredQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  answered_at: string | null;
  asker: { first_name: string } | null;
}

export default function MentorDashboardPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingQuestion[]>([]);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function load() {
    if (!profile) return;
    const { data: mentorRow } = await supabase
      .from("mentors")
      .select("id, display_name, bio, avatar_url, rating_avg, rating_count, is_verified")
      .eq("id", profile.id)
      .maybeSingle();
    const verified = !!mentorRow?.is_verified;
    setIsMentor(verified);
    if (mentorRow) {
      setMentorProfile(mentorRow as MentorProfile);
      setBioDraft(mentorRow.bio ?? "");
    }
    if (!verified) return;

    const [{ data: unanswered }, { data: mine }] = await Promise.all([
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, asked_by, mentor_id, created_at, asker:profiles!mentor_questions_asked_by_fkey(first_name)"
        )
        .is("answer_text", null)
        .or(`mentor_id.eq.${profile.id},mentor_id.is.null`)
        .order("created_at", { ascending: true }),
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, answered_at, asker:profiles!mentor_questions_asked_by_fkey(first_name)"
        )
        .eq("answered_by", profile.id)
        .order("answered_at", { ascending: false })
        .limit(10),
    ]);

    setPending((unanswered ?? []) as unknown as PendingQuestion[]);
    setAnswered((mine ?? []) as unknown as AnsweredQuestion[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5MB");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/photo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("mentor-photos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("mentor-photos").getPublicUrl(path);
      const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      await updateMentorProfile({ avatar_url: url });
      setMentorProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      await updateMentorProfile({ bio: bioDraft.trim() });
      setMentorProfile((prev) => (prev ? { ...prev, bio: bioDraft.trim() } : prev));
    } finally {
      setSavingBio(false);
    }
  }

  function handleAnswer(questionId: string) {
    if (!answerText.trim()) {
      setErrorMsg("Write an answer first.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await answerQuestion(questionId, answerText);
        setAnsweringId(null);
        setAnswerText("");
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't submit your answer");
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (!profile || isMentor === null) {
    return <p className="text-sm font-bold text-text-muted">Loading...</p>;
  }

  if (!isMentor) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">🔒</span>
        <p className="heading-game text-lg">Mentors Only</p>
        <p className="text-sm font-bold text-text-muted">This dashboard is for verified LinkY101 mentors.</p>
      </div>
    );
  }

  const uniqueAskers = new Set(answered.map((a) => a.asker?.first_name)).size;

  const isTopMentor = (mentorProfile?.rating_avg ?? 0) >= 4.5 && (mentorProfile?.rating_count ?? 0) >= 10;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🎓" title="Mentor Dashboard" />

      <GameCard borderColor="sky" glowColor="sky" className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          {mentorProfile?.avatar_url ? (
            <img
              src={mentorProfile.avatar_url}
              alt={mentorProfile.display_name}
              className="h-20 w-20 rounded-full border-4 border-sky object-cover shadow-glow-sky"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-sky bg-gradient-sky-purple text-2xl font-black text-white shadow-glow-sky">
              {mentorProfile?.display_name?.charAt(0).toUpperCase() ?? "M"}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            aria-label="Upload photo"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white shadow-glow-pink disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
        {uploadingPhoto && <p className="text-xs font-bold text-text-muted">Uploading...</p>}
        {photoError && <p className="text-xs font-bold text-orange">{photoError}</p>}

        {isTopMentor && (
          <span className="text-xs font-black uppercase text-yellow">🏆 Top Mentor</span>
        )}
        {(mentorProfile?.rating_count ?? 0) > 0 && (
          <p className="flex items-center gap-1 text-sm font-black text-yellow">
            <Star className="h-4 w-4 fill-yellow" /> {mentorProfile?.rating_avg.toFixed(1)} (
            {mentorProfile?.rating_count} rating{mentorProfile?.rating_count === 1 ? "" : "s"})
          </p>
        )}

        <div className="w-full">
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            placeholder="Write a short bio students will see..."
            className="w-full rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted focus:border-sky focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[10px] font-bold text-text-muted">{bioDraft.length}/{BIO_MAX}</p>
            <button
              type="button"
              onClick={handleSaveBio}
              disabled={savingBio || bioDraft.trim() === (mentorProfile?.bio ?? "")}
              className="rounded-full border-3 border-sky bg-gradient-sky-purple px-3 py-1 text-[10px] font-black uppercase text-white disabled:opacity-40"
            >
              {savingBio ? "Saving..." : "Save Bio"}
            </button>
          </div>
        </div>
      </GameCard>

      <div className="grid grid-cols-2 gap-3">
        <GameCard borderColor="sky" glowColor="sky" className="text-center">
          <p className="text-2xl font-black text-white">{answered.length}</p>
          <p className="text-xs font-bold uppercase text-text-muted">Answers Given</p>
        </GameCard>
        <GameCard borderColor="purple" glowColor="purple" className="text-center">
          <p className="text-2xl font-black text-white">{uniqueAskers}</p>
          <p className="text-xs font-bold uppercase text-text-muted">Students Helped</p>
        </GameCard>
      </div>

      <div>
        <p className="mb-3 font-black uppercase tracking-wide text-white">📥 Unanswered ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="text-sm font-bold text-text-muted">You&apos;re all caught up!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((q) => (
              <GameCard key={q.id} borderColor="sky">
                <p className="mb-1 text-xs font-black text-pink">{q.asker?.first_name ?? "Member"} asked:</p>
                <p className="mb-3 text-sm font-bold text-white">{q.question_text}</p>
                {answeringId === q.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value.slice(0, ANSWER_MAX))}
                      rows={4}
                      placeholder="Write your answer..."
                      className="w-full rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted focus:border-sky focus:outline-none"
                    />
                    <p className="text-right text-xs font-bold text-text-muted">
                      {answerText.length}/{ANSWER_MAX}
                    </p>
                    {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnsweringId(null);
                          setAnswerText("");
                          setErrorMsg(null);
                        }}
                        className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
                      >
                        Cancel
                      </button>
                      <GradientButton
                        variant="sky"
                        size="sm"
                        className="flex-1"
                        disabled={submitting}
                        onClick={() => handleAnswer(q.id)}
                      >
                        {submitting ? "Sending..." : "Submit Answer"}
                      </GradientButton>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAnsweringId(q.id)}
                    className="w-full rounded-xl border-3 border-sky bg-gradient-sky-purple py-2 text-xs font-black uppercase text-white"
                  >
                    Answer
                  </button>
                )}
              </GameCard>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 font-black uppercase tracking-wide text-white">✅ Your Recent Answers</p>
        {answered.length === 0 ? (
          <p className="text-sm font-bold text-text-muted">No answers yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {answered.map((a) => (
              <div key={a.id} className="rounded-xl border-3 border-green bg-card p-3">
                <p className="text-xs font-black text-pink">{a.asker?.first_name ?? "Member"} asked:</p>
                <p className="mb-1 text-sm font-bold text-white">{a.question_text}</p>
                <p className="text-xs font-bold text-text-muted">Your answer: {a.answer_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
