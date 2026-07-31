"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { INTEREST_TAGS } from "@/lib/interests";
import { moderateContent } from "@/lib/moderation";
import { updateNotificationSettings, type NotificationSettings } from "@/lib/actions/push";
import { enablePushNotifications, disablePushNotifications } from "@/lib/pushClient";
import { TOURS } from "@/lib/tutorials";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import SectionTitle from "@/components/ui/SectionTitle";

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]";

interface PrivacySettings {
  hide_activity?: boolean;
  hide_posts?: boolean;
  hide_dream?: boolean;
}

function PrivacyToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
          checked ? "bg-[#2ECC71]" : "bg-gray-300"
        }`}
      >
        <span
          className={`block h-full w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const TOUR_PAGE: Record<string, string> = {
  home: "/home",
  learn: "/learn",
  community: "/community",
  discover: "/discover",
  teams: "/teams",
  profile: "/profile",
};

export default function ProfileSettingsPage() {
  const { profile, updateProfile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const router = useRouter();

  const [initialized, setInitialized] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [headline, setHeadline] = useState("");
  const [dream, setDream] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySettings>({});
  const [notifSettings, setNotifSettings] = useState<Partial<NotificationSettings>>({});
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setFirstName(profile.first_name);
      setHeadline(profile.headline ?? "");
      setDream(profile.dream ?? "");
      setInterests(profile.interests);
      setPrivacy(profile.privacy_settings ?? {});
      setNotifSettings(profile.notification_settings ?? {});
      setInitialized(true);
    }
  }, [profile, initialized]);

  async function handleToggleNotification(key: keyof NotificationSettings, value: boolean) {
    setNotifError(null);

    if (key === "push_enabled") {
      setNotifBusy(true);
      try {
        if (value) {
          const result = await enablePushNotifications();
          if (!result.success) {
            setNotifError(result.reason ?? "Couldn't enable notifications.");
            setNotifBusy(false);
            return;
          }
        } else {
          await disablePushNotifications();
        }
      } finally {
        setNotifBusy(false);
      }
    }

    setNotifSettings((prev) => ({ ...prev, [key]: value }));
    await updateNotificationSettings({ [key]: value });
  }

  function toggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSaveProfile() {
    setSaveError(null);

    for (const [field, value] of [
      ["headline", headline],
      ["dream", dream],
    ] as const) {
      if (!value.trim()) continue;
      const moderation = moderateContent(value);
      if (!moderation.approved) {
        setSaveError(`${field === "headline" ? "Headline" : "Dream"}: ${moderation.reason}`);
        return;
      }
    }

    setSaving(true);
    await updateProfile({
      first_name: firstName.trim(),
      headline: headline.trim() || null,
      dream: dream.trim() || null,
      interests,
      privacy_settings: privacy,
    });
    setSaving(false);
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(null), 2000);
  }

  async function handleChangePassword() {
    setPasswordError(null);
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordMsg("Password updated!");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (!profile) {
    return <p className="text-sm font-semibold text-gray-400">Loading settings...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/profile" className="text-text-muted" aria-label="Back to profile">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <SectionTitle emoji="⚙️" title="Settings" />
      </div>

      <GameCard borderColor="pink" glowColor="pink">
        <p className="mb-3 text-sm font-bold text-gray-900">Edit Profile</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              First Name
            </label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Headline
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, 200))}
              placeholder="Founder in the making..."
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              My Dream
            </label>
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="What do you want to build one day?"
              className={fieldClass}
            />
            <p className="mt-1 text-right text-xs font-semibold text-gray-400">{dream.length}/500</p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-500">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const selected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      selected
                        ? "bg-[#1A1A2E] text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <GradientButton variant="dark" disabled={saving} onClick={handleSaveProfile}>
            {saving ? "Saving..." : "Save Changes"}
          </GradientButton>
          {saveError && <p className="text-center text-xs font-semibold text-[#FF6B6B]">{saveError}</p>}
          {savedMsg && <p className="text-center text-xs font-semibold text-[#2ECC71]">{savedMsg}</p>}
        </div>
      </GameCard>

      <GameCard borderColor="sky" glowColor="sky">
        <p className="mb-3 text-sm font-bold text-gray-900">Privacy</p>
        <div className="flex flex-col gap-3">
          <PrivacyToggle
            label="Hide my activity from my school"
            checked={!!privacy.hide_activity}
            onChange={(v) => setPrivacy((p) => ({ ...p, hide_activity: v }))}
          />
          <PrivacyToggle
            label="Hide my posts on my profile"
            checked={!!privacy.hide_posts}
            onChange={(v) => setPrivacy((p) => ({ ...p, hide_posts: v }))}
          />
          <PrivacyToggle
            label="Hide my dream on my profile"
            checked={!!privacy.hide_dream}
            onChange={(v) => setPrivacy((p) => ({ ...p, hide_dream: v }))}
          />
        </div>
        <GradientButton variant="dark" size="sm" className="mt-4 w-full" disabled={saving} onClick={handleSaveProfile}>
          {saving ? "Saving..." : "Save Privacy Settings"}
        </GradientButton>
      </GameCard>

      <GameCard borderColor="purple" glowColor="purple">
        <p className="mb-3 text-sm font-bold text-gray-900">Notifications</p>
        <div className="flex flex-col gap-3">
          <PrivacyToggle
            label="Push Notifications"
            checked={!!notifSettings.push_enabled}
            onChange={(v) => handleToggleNotification("push_enabled", v)}
          />
          {notifSettings.push_enabled && (
            <>
              <PrivacyToggle
                label="Daily Task Reminders"
                checked={notifSettings.daily_reminder !== false}
                onChange={(v) => handleToggleNotification("daily_reminder", v)}
              />
              <PrivacyToggle
                label="Streak Risk Alerts"
                checked={notifSettings.streak_risk !== false}
                onChange={(v) => handleToggleNotification("streak_risk", v)}
              />
              <PrivacyToggle
                label="Mentor Answers"
                checked={notifSettings.mentor_answers !== false}
                onChange={(v) => handleToggleNotification("mentor_answers", v)}
              />
              <PrivacyToggle
                label="Community Activity"
                checked={notifSettings.community !== false}
                onChange={(v) => handleToggleNotification("community", v)}
              />
            </>
          )}
        </div>
        {notifBusy && <p className="mt-2 text-xs font-semibold text-gray-400">Updating...</p>}
        {notifError && <p className="mt-2 text-xs font-semibold text-[#FF6B6B]">{notifError}</p>}
      </GameCard>

      <GameCard borderColor="purple" glowColor="purple">
        <p className="mb-3 text-sm font-bold text-gray-900">Password</p>
        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={fieldClass}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={fieldClass}
          />
          {passwordError && <p className="text-xs font-semibold text-[#FF6B6B]">{passwordError}</p>}
          {passwordMsg && <p className="text-xs font-semibold text-[#2ECC71]">{passwordMsg}</p>}
          <GradientButton variant="dark" size="sm" className="mt-1 w-full" onClick={handleChangePassword}>
            Update Password
          </GradientButton>
        </div>
      </GameCard>

      <GameCard borderColor="yellow" glowColor="yellow">
        <p className="mb-2 text-sm font-bold text-gray-900">Premium</p>
        {profile.is_premium ? (
          <p className="text-sm font-semibold text-gray-800">
            👑 You&apos;re a Pro member
            {profile.premium_until ? ` until ${new Date(profile.premium_until).toLocaleDateString()}` : ""}.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm font-bold text-text-muted">
              Free plan — Pro unlocks 1-on-1 mentors, the AI coach, pitch reviews and more.
            </p>
            <Link href="/premium">
              <GradientButton variant="yellow" size="sm" className="w-full">
                See LinkY101 Pro 👑
              </GradientButton>
            </Link>
          </>
        )}
      </GameCard>

      <GameCard borderColor="sky" glowColor="sky">
        <p className="mb-3 text-sm font-bold text-gray-900">Replay Tutorials</p>
        <div className="flex flex-col gap-2">
          {TOURS.map((tour) => (
            <button
              key={tour.id}
              type="button"
              onClick={() => router.push(`${TOUR_PAGE[tour.id]}?tour=${tour.id}`)}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left shadow-sm transition-transform active:scale-[0.98]"
            >
              <span className="text-sm font-medium text-gray-800">
                {tour.emoji} {tour.label} Tour
              </span>
              <span className="text-xs font-bold text-[#039BE5]">Replay</span>
            </button>
          ))}
        </div>
      </GameCard>

      <GameCard borderColor="green" glowColor="green">
        <p className="mb-3 text-sm font-bold text-gray-900">Help & Feedback</p>
        <div className="flex gap-2">
          <Link href="/help" className="flex-1">
            <GradientButton variant="green" size="sm" className="w-full">
              ❓ FAQ
            </GradientButton>
          </Link>
          <Link href="/feedback" className="flex-1">
            <GradientButton variant="green" size="sm" className="w-full">
              💬 Contact Us
            </GradientButton>
          </Link>
        </div>
      </GameCard>

      <GameCard borderColor="border">
        <p className="mb-2 text-xs font-semibold text-gray-500">About LinkY101</p>
        <p className="text-sm leading-relaxed text-gray-600">
          LinkY101 is a networking and entrepreneurship platform built for young people aged 13–18 to
          connect, learn, and launch their ideas.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowTerms((v) => !v)}
            className="text-left text-xs font-bold text-[#039BE5]"
          >
            Terms of Service {showTerms ? "▲" : "▼"}
          </button>
          {showTerms && (
            <p className="text-xs text-gray-500">Full terms of service coming soon.</p>
          )}
          <button
            type="button"
            onClick={() => setShowPrivacy((v) => !v)}
            className="text-left text-xs font-bold text-[#039BE5]"
          >
            Privacy Policy {showPrivacy ? "▲" : "▼"}
          </button>
          {showPrivacy && (
            <p className="text-xs text-gray-500">Full privacy policy coming soon.</p>
          )}
        </div>
      </GameCard>
    </div>
  );
}
