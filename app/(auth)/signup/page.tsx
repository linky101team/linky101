"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

const AGE_OPTIONS = [10, 11, 12, 13, 14, 15, 16, 17, 18];
const MIN_AGE = 13;
const MAX_AGE = 18;

const inputClass =
  "w-full rounded-xl border-3 border-border bg-white px-4 py-3 font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none";

interface School {
  id: string;
  name: string;
}

type SchoolType = "school" | "homeschool" | "no_school_yet";

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState<number | "">("");

  const [schools, setSchools] = useState<School[]>([]);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolPanelOpen, setSchoolPanelOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<SchoolType | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolLabel, setSchoolLabel] = useState("");
  const schoolBoxRef = useRef<HTMLDivElement>(null);

  const [parentalConsent, setParentalConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ageBlocked = age !== "" && age < MIN_AGE;

  useEffect(() => {
    supabase
      .from("schools")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setSchools(data as School[]);
      });
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolBoxRef.current && !schoolBoxRef.current.contains(event.target as Node)) {
        setSchoolPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(schoolQuery.toLowerCase())
  );

  function pickSchool(school: School) {
    setSchoolType("school");
    setSchoolId(school.id);
    setSchoolLabel(school.name);
    setSchoolPanelOpen(false);
  }

  function pickHomeschool() {
    setSchoolType("homeschool");
    setSchoolId(null);
    setSchoolLabel("I'm homeschooled");
    setSchoolPanelOpen(false);
  }

  function pickNoSchoolYet() {
    setSchoolType("no_school_yet");
    setSchoolId(null);
    setSchoolLabel("My school isn't on LinkY101 yet");
    setSchoolPanelOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim()) {
      setErrorMsg("Enter your first name.");
      return;
    }
    if (age === "" || age < MIN_AGE || age > MAX_AGE) {
      setErrorMsg("Enter a valid age between 13 and 18.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (!schoolType) {
      setErrorMsg("Let us know where you go to school.");
      return;
    }
    if (!parentalConsent) {
      setErrorMsg("A parent or guardian needs to agree before you can join.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          age,
          school_type: schoolType,
          school_id: schoolId,
          parental_consent: true,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      return;
    }

    router.push("/verify");
  }

  return (
    <main className="auth-gradient-bg flex min-h-screen flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <span className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border-3 border-pink bg-gradient-pink-purple text-2xl font-black text-white shadow-glow-pink">
          🚀
        </span>
        <h1 className="heading-game text-3xl">
          Join Link<span className="text-pink">Y</span>101
        </h1>
        <p className="mt-1 text-sm font-bold text-ink">
          Build. Connect. Launch. Let&apos;s go.
        </p>
      </div>

      <GameCard borderColor="pink" glowColor="pink">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              First Name
            </label>
            <input
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              Email
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              Password
            </label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
              Age
            </label>
            <select
              className={`${inputClass} appearance-none`}
              value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select your age</option>
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {ageBlocked ? (
            <div className="rounded-xl border-3 border-orange bg-white p-4 text-center">
              <p className="font-black uppercase text-orange">
                LinkY101 is for ages 13–18! Come back soon 🚀
              </p>
            </div>
          ) : (
            <>
              <div ref={schoolBoxRef} className="relative">
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
                  School
                </label>
                <button
                  type="button"
                  onClick={() => setSchoolPanelOpen((open) => !open)}
                  className={`${inputClass} flex items-center justify-between text-left ${
                    schoolLabel ? "" : "text-text-muted"
                  }`}
                >
                  <span className="truncate">{schoolLabel || "Find your school"}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={3} />
                </button>

                {schoolPanelOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl border-3 border-purple bg-card p-2 shadow-glow-purple">
                    <div className="relative mb-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        value={schoolQuery}
                        onChange={(e) => setSchoolQuery(e.target.value)}
                        placeholder="Search schools..."
                        className="w-full rounded-lg border-3 border-border bg-white py-2 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-text-muted focus:border-purple focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={pickHomeschool}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-ink hover:bg-white"
                    >
                      🏠 I&apos;m homeschooled
                    </button>
                    <button
                      type="button"
                      onClick={pickNoSchoolYet}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-ink hover:bg-white"
                    >
                      🏫 My school isn&apos;t on LinkY101 yet
                    </button>

                    <div className="my-1 border-t-3 border-border" />

                    <div className="max-h-40 overflow-y-auto">
                      {filteredSchools.length === 0 && (
                        <p className="px-3 py-2 text-sm font-bold text-text-muted">
                          No schools found.
                        </p>
                      )}
                      {filteredSchools.map((school) => (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => pickSchool(school)}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-ink hover:bg-white"
                        >
                          {school.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm font-bold text-text-muted">
                <input
                  type="checkbox"
                  checked={parentalConsent}
                  onChange={(e) => setParentalConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-pink"
                />
                A parent or guardian has agreed to me using LinkY101
              </label>

              {errorMsg && (
                <p className="text-center text-sm font-bold text-orange">{errorMsg}</p>
              )}

              <GradientButton
                type="submit"
                variant="pink"
                size="lg"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Joining..." : "Join LinkY101 🚀"}
              </GradientButton>
            </>
          )}
        </form>
      </GameCard>

      <p className="text-center text-sm font-bold text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-sky">
          Log in
        </Link>
      </p>
    </main>
  );
}
