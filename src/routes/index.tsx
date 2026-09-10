import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";

import {
  validatePostInput,
  type TeamUpPost,
  type PostInput,
  type FieldErrors,
} from "@/lib/teamup";
import {
  fetchPosts,
  insertPost,
  updatePostStatus,
  deletePost,
  importPosts,
  resetBoard,
  rowToPost,
} from "@/lib/teamup-db";
import { supabase } from "@/integrations/supabase/client";
import { PostForm } from "@/components/teamup/PostForm";
import { PostCard } from "@/components/teamup/PostCard";
import { FilterBar } from "@/components/teamup/FilterBar";
import { DataActions } from "@/components/teamup/DataActions";

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
  "bg-sky/60 text-ocean border border-ocean/20",
  "bg-lilac/70 text-ink/80 border border-ink/10",
  "bg-butter/70 text-ink/80 border border-ink/10",
  "bg-blush/70 text-rose border border-rose/20",
] as const;

function tintFor(code: string): string {
  let sum = 0;
  for (const ch of code) sum += ch.charCodeAt(0);
  return courseTints[sum % courseTints.length] ?? courseTints[0];
}

function Index() {
  const [posts, setPosts] = useState<TeamUpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "FULFILLED">("ALL");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    let active = true;

    fetchPosts()
      .then((rows) => {
        if (active) setPosts(rows);
      })
      .catch(() => {
        if (active) toast.error("Could not load the board. Please refresh.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const channel = supabase
      .channel("teamup-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teamup_posts" },
        (payload) => {
          if (!active) return;
          if (payload.eventType === "INSERT") {
            const post = rowToPost(payload.new as never);
            setPosts((prev) =>
              prev.some((p) => p.id === post.id) ? prev : [post, ...prev],
            );
          } else if (payload.eventType === "UPDATE") {
            const post = rowToPost(payload.new as never);
            setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
          } else if (payload.eventType === "DELETE") {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) {
              setPosts((prev) => prev.filter((p) => p.id !== removedId));
            }
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.createdAt - a.createdAt),
    [posts],
  );

  const courses = useMemo(
    () => Array.from(new Set(sorted.map((p) => p.courseCode))).sort(),
    [sorted],
  );

  // Collect most common skills across all posts for quick filters
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

  // Comprehensive multi-criteria filtering
  const visible = useMemo(() => {
    return sorted.filter((p) => {
      // Course filter
      if (course !== "all" && p.courseCode !== course) return false;

      // Status filter
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;

      // Skill tag filter
      if (selectedSkill) {
        const skillLower = selectedSkill.toLowerCase();
        const hasOffer = p.offers.some((s) => s.toLowerCase() === skillLower);
        const hasNeed = p.needs.some((s) => s.toLowerCase() === skillLower);
        if (!hasOffer && !hasNeed) return false;
      }

      // Search query filter (matches name, course, offers, or needs)
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

  async function handleCreatePost(input: PostInput): Promise<boolean> {
    const validation = validatePostInput(input);
    if (!validation.success || !validation.data) {
      setFieldErrors(validation.errors);
      toast.error("Please fix the errors indicated on the form.");
      return false;
    }

    setFieldErrors({});

    try {
      const newPost = await insertPost(validation.data);
      setPosts((prev) =>
        prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev],
      );
      setNewestId(newPost.id);
      toast.success(`Request pinned to the board for ${newPost.courseCode}!`);
      return true;
    } catch {
      toast.error("Could not pin the request. Please try again.");
      return false;
    }
  }

  function handleToggleReveal(id: string) {
    setRevealed((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleToggleStatus(id: string) {
    const current = posts.find((p) => p.id === id);
    if (!current) return;
    const nextStatus = current.status === "FULFILLED" ? "OPEN" : "FULFILLED";
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
    );
    try {
      await updatePostStatus(id, nextStatus);
      toast.info(
        nextStatus === "FULFILLED"
          ? "Post marked as teammate found / fulfilled!"
          : "Post reopened for teammates!",
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: current.status } : p)),
      );
      toast.error("Could not update the request. Please try again.");
    }
  }

  async function handleDeletePost(id: string) {
    const snapshot = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePost(id);
      toast.success("Post deleted from the board.");
    } catch {
      setPosts(snapshot);
      toast.error("Could not delete the request. Please try again.");
    }
  }

  function handleCopyContact(contact: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contact);
      toast.success("Contact copied to clipboard!");
    }
  }

  async function handleImportPosts(imported: TeamUpPost[]) {
    try {
      await importPosts(imported);
      setPosts(await fetchPosts());
      toast.success(`Successfully imported ${imported.length} posts to the shared board!`);
    } catch {
      toast.error("Could not import those posts. Please check the file.");
    }
  }

  async function handleResetSeed() {
    try {
      await resetBoard();
      setPosts(await fetchPosts());
      setCourse("all");
      setSearchQuery("");
      setSelectedSkill(null);
      setStatusFilter("ALL");
      toast.info("Shared board reset to the campus demo posts.");
    } catch {
      toast.error("Could not reset the board. Please try again.");
    }
  }

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

  return (
    <div className="min-h-screen bg-cream font-sans text-ink selection:bg-rose/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-rose text-cream shadow-xs">
              <Users className="size-5" />
            </span>
            <div className="leading-tight">
              <span className="font-display text-xl font-bold tracking-tight text-ink">TeamUp</span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-ink">
                Campus Project Matchmaker · Part 2
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-leaf/30 bg-mint/50 px-3 py-1 text-xs font-semibold text-leaf">
              ● Live Sync
            </span>
            <span className="hidden sm:inline-block rounded-full border border-ink/10 bg-surface/80 px-3 py-1 text-xs font-medium text-muted-ink">
              USJP BICT
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left Column: Post Creation Form */}
          <aside>
            <PostForm onSubmit={handleCreatePost} fieldErrors={fieldErrors} />
          </aside>

          {/* Right Column: Search, Filters, Post Board, Data Persistence Actions */}
          <section className="space-y-6">
            {/* Header Title & Counter */}
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
                  The Project Board
                </h1>
                <p className="mt-0.5 text-xs text-muted-ink font-medium">
                  {loading
                    ? "Loading the shared board…"
                    : `Showing ${visible.length} of ${posts.length} requests · Updates live for everyone`}
                </p>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose hover:underline"
                >
                  Clear active filters
                </button>
              ) : null}
            </div>

            {/* Filter & Search Bar */}
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

            {/* Cards Grid / Empty State */}
            {visible.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-ink/15 bg-surface/60 p-12 text-center backdrop-blur-sm">
                <p className="font-display text-2xl font-bold text-ink">No requests match your filters</p>
                <p className="mx-auto mt-2 max-w-[44ch] text-xs text-muted-ink">
                  {hasActiveFilters
                    ? "Try adjusting your search query, course filter, or skill tag to see more classmate requests."
                    : "No requests pinned yet. Use the form on the left to pin the first project teammate request!"}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-cream hover:bg-rose/90"
                  >
                    Reset All Filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
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

            {/* Data Persistence Tools & Backup */}
            <DataActions
              posts={posts}
              onImport={handleImportPosts}
              onReset={handleResetSeed}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
