import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  loadPosts,
  parseSkills,
  savePosts,
  seedPosts,
  type TeamUpPost,
} from "@/lib/teamup";

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

  const visible = useMemo(
    () => (course === "all" ? sorted : sorted.filter((p) => p.courseCode === course)),
    [sorted, course],
  );

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const offers = parseSkills(form.offers);
    const needs = parseSkills(form.needs);

    if (
      !form.name.trim() ||
      !form.indexNumber.trim() ||
      !form.courseCode.trim() ||
      !form.contact.trim() ||
      offers.length === 0 ||
      needs.length === 0
    ) {
      setError("Fill every field — at least one skill offered and one needed.");
      return;
    }

    const post: TeamUpPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      indexNumber: form.indexNumber.trim(),
      courseCode: form.courseCode.trim().toUpperCase(),
      offers,
      needs,
      contact: form.contact.trim(),
      createdAt: Date.now(),
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
              <label className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-surface/60 px-3 py-2 text-sm backdrop-blur">
                <span className="text-muted-ink">Course</span>
                <select
                  className="cursor-pointer bg-transparent font-medium outline-none"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="all">All courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
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
                {visible.map((post) => {
                  const isNew = post.id === newestId;
                  const isOpen = revealed.includes(post.id);
                  return (
                    <article
                      key={post.id}
                      className={`relative rounded-[24px] border border-ink/10 bg-surface/85 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-rose/30 ${
                        isNew ? "animate-[pin_0.6s_cubic-bezier(0.32,0.72,0,1)_both]" : ""
                      }`}
                    >
                      {isNew ? (
                        <>
                          <span className="absolute -top-2 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full bg-rose shadow-sm">
                            <span className="block size-2 rounded-full bg-cream/90" />
                          </span>
                          <span className="absolute -top-2 right-4 rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-leaf">
                            New
                          </span>
                        </>
                      ) : null}

                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div>
                          <p className="font-display text-lg font-semibold">{post.name}</p>
                          <p className="text-xs text-muted-ink">
                            {post.indexNumber} · {post.courseCode}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tintFor(post.courseCode)}`}
                        >
                          {post.courseCode}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-leaf">
                          Offers
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {post.offers.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-mint/60 px-2.5 py-1 text-xs font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-rose">
                          Needs
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {post.needs.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-dashed border-rose/40 bg-blush/30 px-2.5 py-1 text-xs font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="mt-4 animate-[up_0.35s_ease_both] rounded-2xl bg-cream/70 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-ink">
                            Contact
                          </p>
                          <p className="mt-1 text-sm font-medium">{post.contact}</p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevealed((r) => [...r, post.id])}
                          className="group mt-4 flex items-center gap-1.5 text-sm font-semibold text-rose transition-colors hover:text-ink"
                        >
                          <span>Reveal contact</span>
                          <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                            ↓
                          </span>
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
