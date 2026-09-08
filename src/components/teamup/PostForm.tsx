import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import type { PostInput, FieldErrors } from "@/lib/teamup";

interface PostFormProps {
  onSubmit: (data: PostInput) => Promise<boolean>;
  fieldErrors: FieldErrors;
}

export function PostForm({ onSubmit, fieldErrors }: PostFormProps) {
  const [form, setForm] = useState<PostInput>({
    name: "",
    indexNumber: "",
    courseCode: "",
    offers: "",
    needs: "",
    contact: "",
    creatorPin: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);

  function update(key: keyof PostInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(form);
      if (success) {
        setForm({
          name: "",
          indexNumber: "",
          courseCode: "",
          offers: "",
          needs: "",
          contact: "",
          creatorPin: "",
        });
        setShowPinInput(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="h-fit rounded-[28px] border border-ink/10 bg-surface/80 p-6 backdrop-blur-xl shadow-sm lg:sticky lg:top-24"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink">Pin a request</h2>
        <span className="flex items-center gap-1 rounded-full bg-mint/50 px-2.5 py-0.5 text-[11px] font-semibold text-leaf">
          <Sparkles className="size-3" /> Quick Post
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-ink">
        Specify what you can offer and what skill you need. Classmates can contact you directly.
      </p>

      <div className="mt-5 space-y-3.5">
        {/* Name & Index */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="post-name" className="block text-xs font-semibold text-muted-ink">
              Full Name <span className="text-rose">*</span>
            </label>
            <input
              id="post-name"
              type="text"
              required
              placeholder="e.g. Kasun Perera"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={`field ${fieldErrors.name ? "border-rose ring-1 ring-rose/30" : ""}`}
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="post-index" className="block text-xs font-semibold text-muted-ink">
              Index Number <span className="text-rose">*</span>
            </label>
            <input
              id="post-index"
              type="text"
              required
              placeholder="23014889 or ICT/22/101"
              value={form.indexNumber}
              onChange={(e) => update("indexNumber", e.target.value)}
              className={`field ${fieldErrors.indexNumber ? "border-rose ring-1 ring-rose/30" : ""}`}
            />
            {fieldErrors.indexNumber ? (
              <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.indexNumber}</p>
            ) : null}
          </div>
        </div>

        {/* Course Code */}
        <div>
          <label htmlFor="post-course" className="block text-xs font-semibold text-muted-ink">
            Course Code <span className="text-rose">*</span>
          </label>
          <input
            id="post-course"
            type="text"
            required
            placeholder="e.g. CS201, IIC2223"
            value={form.courseCode}
            onChange={(e) => update("courseCode", e.target.value)}
            className={`field ${fieldErrors.courseCode ? "border-rose ring-1 ring-rose/30" : ""}`}
          />
          {fieldErrors.courseCode ? (
            <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.courseCode}</p>
          ) : null}
        </div>

        {/* Offers Skills */}
        <div className="rounded-2xl bg-mint/40 p-3.5 border border-leaf/10">
          <label htmlFor="post-offers" className="block text-xs font-bold uppercase tracking-wide text-leaf">
            I Can Offer <span className="text-rose">*</span>
          </label>
          <input
            id="post-offers"
            type="text"
            required
            placeholder="Figma, UI Design, CSS (comma-separated)"
            value={form.offers}
            onChange={(e) => update("offers", e.target.value)}
            className={`field bg-surface/90 ${fieldErrors.offers ? "border-rose ring-1 ring-rose/30" : ""}`}
          />
          <p className="mt-1 text-[10px] text-muted-ink">Separate multiple skills with commas</p>
          {fieldErrors.offers ? (
            <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.offers}</p>
          ) : null}
        </div>

        {/* Needs Skills */}
        <div className="rounded-2xl bg-blush/40 p-3.5 border border-rose/10">
          <label htmlFor="post-needs" className="block text-xs font-bold uppercase tracking-wide text-rose">
            I Need Help With <span className="text-rose">*</span>
          </label>
          <input
            id="post-needs"
            type="text"
            required
            placeholder="Python, Database, Machine Learning"
            value={form.needs}
            onChange={(e) => update("needs", e.target.value)}
            className={`field bg-surface/90 ${fieldErrors.needs ? "border-rose ring-1 ring-rose/30" : ""}`}
          />
          <p className="mt-1 text-[10px] text-muted-ink">Separate multiple skills with commas</p>
          {fieldErrors.needs ? (
            <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.needs}</p>
          ) : null}
        </div>

        {/* Contact Method */}
        <div>
          <label htmlFor="post-contact" className="block text-xs font-semibold text-muted-ink">
            Contact Method (Email or Phone) <span className="text-rose">*</span>
          </label>
          <input
            id="post-contact"
            type="text"
            required
            placeholder="student@sjp.ac.lk or 0771234567"
            value={form.contact}
            onChange={(e) => update("contact", e.target.value)}
            className={`field ${fieldErrors.contact ? "border-rose ring-1 ring-rose/30" : ""}`}
          />
          {fieldErrors.contact ? (
            <p className="mt-1 text-[11px] font-medium text-rose">{fieldErrors.contact}</p>
          ) : null}
        </div>

        {/* Creator PIN (Optional security feature) */}
        <div>
          {showPinInput ? (
            <div className="rounded-2xl border border-ink/10 bg-surface/60 p-3">
              <label htmlFor="post-pin" className="block text-xs font-semibold text-ink flex items-center gap-1.5">
                <Lock className="size-3 text-muted-ink" /> Set a 4-Digit Management PIN (Optional)
              </label>
              <input
                id="post-pin"
                type="password"
                maxLength={4}
                placeholder="e.g. 1234"
                value={form.creatorPin}
                onChange={(e) => update("creatorPin", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/10 bg-surface px-3 py-1.5 font-mono text-xs tracking-wider outline-none"
              />
              <p className="mt-1 text-[10px] text-muted-ink">
                Use this PIN to edit or delete your post later.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPinInput(true)}
              className="text-[11px] font-medium text-muted-ink hover:text-ink flex items-center gap-1"
            >
              <Lock className="size-3" /> + Add PIN to protect this post
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose px-4 py-3 font-display text-base font-semibold text-cream shadow-sm transition-all duration-200 hover:bg-rose/90 ${
          isSubmitting ? "cursor-not-allowed opacity-60" : "hover:shadow-md active:scale-[0.99]"
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
            Pinning to board...
          </>
        ) : (
          <>
            Pin to the board
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
