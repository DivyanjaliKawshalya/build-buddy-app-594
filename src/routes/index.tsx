import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  loadPosts,
  parseSkills,
  savePosts,
  seedPosts,
  validatePostInput,
  type TeamUpPost,
} from "@/lib/teamup";
import { FilterBar } from "@/components/teamup/FilterBar";
import { PostCard } from "@/components/teamup/PostCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeamUp — Find project teammates by skill" },
      {
        name: "description",
        content:
          "Post the skills you have and the skills you need, browse open project requests by course code, and contact a matching classmate directly.",
      },
      { property: "og:title", content: "TeamUp — Find project teammates by skill" },
      {
        property: "og:description",
        content:
          "A lightweight campus board for finding group project teammates with complementary skills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const courseTints = [
  "bg-sky/60 text-ocean",
  "bg-lilac/70 text-ink/70",
  "bg-butter/70 text-ink/70",
  "bg-blush/70 text-ink/70",
];

function tintFor(code: string) {
  let sum = 0;
  for (const ch of code) sum += ch.charCodeAt(0);
  return courseTints[sum % courseTints.length];
}

function Index() {
  const [posts, setPosts] = useState<TeamUpPost[]>(seedPosts);
  const [hydrated, setHydrated] = useState(false);
  const [course, setCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "FULFILLED">("ALL");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    indexNumber: "",
    courseCode: "",
    offers: "",
    needs: "",
    contact: "",
  });

  useEffect(() => {
    setPosts(loadPosts());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePosts(posts);
  }, [posts, hydrated]);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.createdAt - a.createdAt),
    [posts],
  );

  const courses = useMemo(
    () => Array.from(new Set(sorted.map((p) => p.courseCode))).sort(),
    [sorted],
  );

  const popularSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      for (const s of [...p.offers, ...p.needs]) {
        counts[s] = (counts[s] || 0) + 1;
      }
    }
    return Object.keys(counts)
      .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
      .slice(0, 8);
  }, [posts]);

  const visible = useMemo(() => {
    return sorted.filter((p) => {
      if (course !== "all" && p.courseCode !== course) return false;
      if (statusFilter !== "ALL" && (p.status || "OPEN") !== statusFilter) return false;

      if (selectedSkill) {
        const skillLower = selectedSkill.toLowerCase();
        const hasOffer = p.offers.some((s) => s.toLowerCase() === skillLower);
        const hasNeed = p.needs.some((s) => s.toLowerCase() === skillLower);
        if (!hasOffer && !hasNeed) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const courseMatch = p.courseCode.toLowerCase().includes(q);
        const indexMatch = p.indexNumber.toLowerCase().includes(q);
        const offerMatch = p.offers.some((s) => s.toLowerCase().includes(q));
        const needMatch = p.needs.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !courseMatch && !indexMatch && !offerMatch && !needMatch) {
          return false;
        }
      }

      return true;
    });
  }, [sorted, course, statusFilter, selectedSkill, searchQuery]);

  const hasActiveFilters =
    course !== "all" ||
    searchQuery.trim() !== "" ||
    selectedSkill !== null ||
    statusFilter !== "ALL";

  function clearAllFilters() {
    setCourse("all");
    setSearchQuery("");
    setSelectedSkill(null);
    setStatusFilter("ALL");
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validatePostInput(form);
    if (!validation.success || !validation.data) {
      const firstError = Object.values(validation.errors)[0] || "Please enter valid details.";
      setError(firstError);
      return;
    }

    const post: TeamUpPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      ...validation.data,
    };

    setPosts((p) => [post, ...p]);
    setNewestId(post.id);
    setRevealed([]);
    setCourse("all");
    setError(null);
    setForm({
      name: "",
      indexNumber: "",
      courseCode: "",
      offers: "",
      needs: "",
      contact: "",
    });
  }

  function handleToggleReveal(id: string) {
    setRevealed((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleToggleStatus(id: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "FULFILLED" ? "OPEN" : "FULFILLED";
          return { ...p, status: nextStatus };
        }
        return p;
      }),
    );
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCopyContact(contact: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contact);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-rose">
              <span className="block size-2.5 rounded-full bg-cream" />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg font-semibold">TeamUp</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-ink">
                group project matchmaker
              </p>
            </div>
          </div>
          <span className="rounded-full border border-ink/10 bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-ink backdrop-blur">
            No login needed
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
          <form
            onSubmit={submit}
            className="h-fit rounded-[28px] border border-ink/10 bg-surface/70 p-6 backdrop-blur-xl lg:sticky lg:top-24"
          >
            <p className="font-display text-2xl font-semibold">Pin a request</p>
            <p className="mt-1 text-sm text-muted-ink">
              Offer a skill, ask for one. Your post goes straight to the board.
            </p>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label-text">Name</span>
                  <input
                    className="field"
                    placeholder="Ada Okafor"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label-text">Index no.</span>
                  <input
                    className="field"
                    placeholder="23014889"
                    value={form.indexNumber}
                    onChange={(e) => update("indexNumber", e.target.value)}
                  />
                </label>
              </div>

              <label className="block">
                <span className="label-text">Course code</span>
                <input
                  className="field"
                  placeholder="CS201"
                  value={form.courseCode}
                  onChange={(e) => update("courseCode", e.target.value)}
                />
              </label>

              <div className="rounded-2xl bg-mint/50 p-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-leaf">
                    I can offer
                  </span>
                  <input
                    className="field bg-surface/70"
                    placeholder="Data viz, Figma"
                    value={form.offers}
                    onChange={(e) => update("offers", e.target.value)}
                  />
                </label>
                <p className="mt-1.5 text-[11px] text-muted-ink">Separate skills with commas</p>
              </div>

              <div className="rounded-2xl bg-blush/50 p-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rose">
                    I need help with
                  </span>
                  <input
                    className="field bg-surface/70"
                    placeholder="SQL, Python"
                    value={form.needs}
                    onChange={(e) => update("needs", e.target.value)}
                  />
                </label>
                <p className="mt-1.5 text-[11px] text-muted-ink">Separate skills with commas</p>
              </div>

              <label className="block">
                <span className="label-text">Contact method</span>
                <input
                  className="field"
                  placeholder="ada@campus.edu"
                  value={form.contact}
                  onChange={(e) => update("contact", e.target.value)}
                />
              </label>
            </div>

            {error ? <p className="mt-3 text-xs font-medium text-rose">{error}</p> : null}

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose px-4 py-3 font-display text-base font-semibold text-cream transition-all duration-200 hover:bg-rose/90"
            >
              Pin to the board
              <span aria-hidden>→</span>
            </button>
          </form>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="animate-[up_0.5s_cubic-bezier(0.32,0.72,0,1)_both]">
                <h1 className="font-display text-4xl font-semibold">The board</h1>
                <p className="text-sm text-muted-ink">
                  Newest requests pinned first · {visible.length} open
                </p>
              </div>
            </div>

            <div className="mt-4">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCourse={course}
                onCourseChange={setCourse}
                courses={courses}
                selectedSkill={selectedSkill}
                onSkillSelect={setSelectedSkill}
                popularSkills={popularSkills}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onClearFilters={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            {visible.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-ink/15 bg-surface/60 p-10 text-center">
                <p className="font-display text-2xl font-semibold">Nothing pinned yet</p>
                <p className="mx-auto mt-2 max-w-[42ch] text-sm text-muted-ink">
                  {course === "all"
                    ? "Be the first to post what you can offer and what you still need."
                    : `No open requests for ${course} yet. Try another course or pin the first one.`}
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {visible.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isNew={post.id === newestId}
                    isRevealed={revealed.includes(post.id)}
                    onToggleReveal={handleToggleReveal}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeletePost}
                    onSkillClick={(skill) => setSelectedSkill(skill)}
                    onCopyContact={handleCopyContact}
                    courseTint={tintFor(post.courseCode)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
