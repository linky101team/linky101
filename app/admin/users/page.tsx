"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { setUserPremium, setUserAdmin } from "@/lib/actions/admin";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface UserRow {
  id: string;
  first_name: string;
  level: number;
  xp: number;
  current_streak: number;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
}

const PAGE_SIZE = 25;

export default function AdminUsersPage() {
  const { profile: me } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("id, first_name, level, xp, current_streak, is_premium, is_admin, created_at")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (search.trim()) {
        query = query.ilike("first_name", `%${search.trim()}%`);
      }

      const { data } = await query;
      setUsers((data as UserRow[]) ?? []);
      setLoading(false);
    }
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, supabase]);

  function handleTogglePremium(user: UserRow) {
    setBusyId(user.id);
    setErrorMsg(null);
    const next = !user.is_premium;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_premium: next } : u)));
    startTransition(async () => {
      try {
        await setUserPremium(user.id, next);
      } catch (err) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_premium: !next } : u)));
        setErrorMsg(err instanceof Error ? err.message : "Failed to update");
      } finally {
        setBusyId(null);
      }
    });
  }

  function handleToggleAdmin(user: UserRow) {
    setBusyId(user.id);
    setErrorMsg(null);
    const next = !user.is_admin;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_admin: next } : u)));
    startTransition(async () => {
      try {
        await setUserAdmin(user.id, next);
      } catch (err) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_admin: !next } : u)));
        setErrorMsg(err instanceof Error ? err.message : "Failed to update");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="👤" title="Users" />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by first name..."
          className="w-full rounded-xl border-3 border-border bg-card py-2.5 pl-9 pr-3 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
        />
      </div>

      {errorMsg && (
        <p className="rounded-xl border-3 border-orange bg-orange/10 px-3 py-2 text-xs font-bold text-orange">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">No users found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <GameCard key={user.id} borderColor="border" className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-sm font-black text-white">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">{user.first_name}</p>
                <p className="text-[10px] font-bold text-text-muted">
                  LV {user.level} · {user.xp} XP · 🔥{user.current_streak}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  disabled={busyId === user.id}
                  onClick={() => handleTogglePremium(user)}
                  className={`rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase disabled:opacity-40 ${
                    user.is_premium ? "border-yellow bg-yellow/20 text-yellow" : "border-border text-text-muted"
                  }`}
                >
                  {user.is_premium ? "✨ Premium" : "Free"}
                </button>
                <button
                  type="button"
                  disabled={busyId === user.id || user.id === me?.id}
                  onClick={() => handleToggleAdmin(user)}
                  className={`rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase disabled:opacity-40 ${
                    user.is_admin ? "border-purple bg-purple/20 text-purple" : "border-border text-text-muted"
                  }`}
                >
                  {user.is_admin ? "🛠️ Admin" : "Make Admin"}
                </button>
              </div>
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
