"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";

interface ProfileResult {
  id: string;
  first_name: string;
  level: number;
}
interface PostResult {
  id: string;
  title: string | null;
  body: string | null;
  feed_type: string;
}
interface SchoolResult {
  id: string;
  name: string;
}

export default function SearchBar() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<ProfileResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [schools, setSchools] = useState<SchoolResult[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setProfiles([]);
      setPosts([]);
      setSchools([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const like = `%${trimmed}%`;
      const [{ data: p }, { data: po }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, level").ilike("first_name", like).limit(5),
        supabase
          .from("posts")
          .select("id, title, body, feed_type")
          .eq("moderation_status", "approved")
          .or(`title.ilike.${like},body.ilike.${like}`)
          .limit(5),
        supabase.from("schools").select("id, name").ilike("name", like).limit(5),
      ]);
      setProfiles(p ?? []);
      setPosts(po ?? []);
      setSchools(s ?? []);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, supabase]);

  const hasResults = profiles.length > 0 || posts.length > 0 || schools.length > 0;
  const showPanel = query.trim().length >= 2;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search founders, posts, schools..."
          className="w-full rounded-xl border-3 border-border bg-card py-3 pl-9 pr-9 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border-3 border-pink bg-card p-3 shadow-glow-pink">
          {loading && <p className="text-xs font-bold text-text-muted">Searching...</p>}
          {!loading && !hasResults && (
            <p className="text-xs font-bold text-text-muted">No results for &quot;{query}&quot;</p>
          )}

          {profiles.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-pink">Founders</p>
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy/40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-pink-purple text-[10px] font-black text-white">
                    {p.first_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-ink">{p.first_name}</span>
                  <span className="ml-auto text-xs font-bold text-text-muted">Lv {p.level}</span>
                </div>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-sky">Posts</p>
              {posts.map((p) => (
                <div key={p.id} className="rounded-lg px-2 py-1.5 hover:bg-navy/40">
                  <p className="truncate text-sm font-bold text-ink">{p.title ?? p.body}</p>
                </div>
              ))}
            </div>
          )}

          {schools.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-purple">Schools</p>
              {schools.map((s) => (
                <div key={s.id} className="rounded-lg px-2 py-1.5 hover:bg-navy/40">
                  <p className="text-sm font-bold text-ink">{s.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
