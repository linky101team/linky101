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

const AVATAR_COLORS = ["#FF6B6B", "#FFC107", "#2ECC71", "#039BE5", "#A78BFA"];

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
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search founders, posts, schools..."
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          {loading && <p className="text-xs font-semibold text-gray-400">Searching...</p>}
          {!loading && !hasResults && (
            <p className="text-xs font-semibold text-gray-400">No results for &quot;{query}&quot;</p>
          )}

          {profiles.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Founders</p>
              {profiles.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {p.first_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{p.first_name}</span>
                </div>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Posts</p>
              {posts.map((p) => (
                <div key={p.id} className="rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <p className="truncate text-sm font-semibold text-gray-900">{p.title ?? p.body}</p>
                </div>
              ))}
            </div>
          )}

          {schools.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Schools</p>
              {schools.map((s) => (
                <div key={s.id} className="rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
