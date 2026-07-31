"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import Card from "@/components/ui/GameCard";
import Button from "@/components/ui/GradientButton";

const AGE_OPTIONS = [10, 11, 12, 13, 14, 15, 16, 17, 18];
const MIN_AGE = 13;
const MAX_AGE = 18;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:ring-1 focus:ring-[#039BE5] focus:outline-none";

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
    <main className="auth-gradient-bg flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Join LinkY<span className="text-[#F5B301]">101</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Start your entrepreneurship journey
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
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
              <label className="mb-1 block text-sm font-medium text-gray-600">
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
              <label className="mb-1 block text-sm font-medium text-gray-600">
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
              <label className="mb-1 block text-sm font-medium text-gray-600">
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
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-600">
                  LinkY101 is for ages 13-18. Come back when you&apos;re old enough!
                </p>
              </div>
            ) : (
              <>
                <div ref={schoolBoxRef} className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    School
                  </label>
                  <button
                    type="button"
                    onClick={() => setSchoolPanelOpen((open) => !open)}
                    className={`${inputClass} flex items-center justify-between text-left ${
                      schoolLabel ? "" : "text-gray-400"
                    }`}
                  >
                    <span className="truncate">{schoolLabel || "Find your school"}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>

                  {schoolPanelOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                      <div className="relative mb-2">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          value={schoolQuery}
                          onChange={(e) => setSchoolQuery(e.target.value)}
                          placeholder="Search schools..."
                          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={pickHomeschool}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                      >
                        I&apos;m homeschooled
                      </button>
                      <button
                        type="button"
                        onClick={pickNoSchoolYet}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                      >
                        My school isn&apos;t on LinkY101 yet
                      </button>

                      <div className="my-1 border-t border-gray-200" />

                      <div className="max-h-40 overflow-y-auto">
                        {filteredSchools.length === 0 && (
                          <p className="px-3 py-2 text-sm text-gray-400">
                            No schools found.
                          </p>
                        )}
                        {filteredSchools.map((school) => (
                          <button
                            key={school.id}
                            type="button"
                            onClick={() => pickSchool(school)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                          >
                            {school.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#2ECC71]"
                  />
                  A parent or guardian has agreed to me using LinkY101
                </label>

                {errorMsg && (
                  <p className="text-center text-sm text-red-500">{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  variant="green"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Joining..." : "Join LinkY101"}
                </Button>
              </>
            )}
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#039BE5] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
