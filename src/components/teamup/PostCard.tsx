import { useState } from "react";
import { CheckCircle2, Clock, Copy, Check, Trash2, Eye, EyeOff } from "lucide-react";
import type { TeamUpPost } from "@/lib/teamup";

interface PostCardProps {
  post: TeamUpPost;
  isNew: boolean;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onToggleStatus: (id: string, pin?: string) => void;
  onDelete: (id: string, pin?: string) => void;
  onSkillClick: (skill: string) => void;
  onCopyContact: (contact: string) => void;
  courseTint: string;
}

export function PostCard({
  post,
  isNew,
  isRevealed,
  onToggleReveal,
  onToggleStatus,
  onDelete,
  onSkillClick,
  onCopyContact,
  courseTint,
}: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [actionType, setActionType] = useState<"toggle" | "delete">("toggle");

  const isFulfilled = post.status === "FULFILLED";

  function handleCopy() {
    onCopyContact(post.contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleVerifyPinAndExecute() {
    if (post.creatorPin && pinInput.trim() !== post.creatorPin) {
      setPinError("Incorrect 4-digit PIN for this post");
      return;
    }

    if (actionType === "toggle") {
      onToggleStatus(post.id, pinInput);
    } else {
      onDelete(post.id, pinInput);
    }
    setShowManageModal(false);
    setPinInput("");
    setPinError("");
  }

  function initiateAction(type: "toggle" | "delete") {
    setActionType(type);
    if (post.creatorPin) {
      setShowManageModal(true);
      setPinError("");
    } else {
      if (type === "toggle") {
        onToggleStatus(post.id);
      } else {
        if (window.confirm("Are you sure you want to delete this post?")) {
          onDelete(post.id);
        }
      }
    }
  }

  return (
    <article
      className={`relative rounded-[24px] border transition-all duration-200 hover:-translate-y-1 ${
        isFulfilled
          ? "border-ink/10 bg-surface/50 opacity-75 hover:opacity-100"
          : "border-ink/10 bg-surface/90 shadow-xs hover:border-rose/30 hover:shadow-md"
      } p-5 backdrop-blur-xl ${
        isNew ? "animate-[pin_0.6s_cubic-bezier(0.32,0.72,0,1)_both]" : ""
      }`}
    >
      {/* Top badges */}
      {isNew ? (
        <span className="absolute -top-2 right-4 rounded-full bg-leaf/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-leaf">
          New
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">{post.name}</h3>
            {isFulfilled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-ink">
                <CheckCircle2 className="size-3 text-leaf" /> Fulfilled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/40 px-2 py-0.5 text-[10px] font-bold uppercase text-leaf">
                <Clock className="size-3" /> Open
              </span>
            )}
          </div>
          <p className="text-xs text-muted-ink">
            {post.indexNumber} · {post.courseCode}
          </p>
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${courseTint}`}>
          {post.courseCode}
        </span>
      </div>

      {/* Offers Skills */}
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-leaf">
          I can offer
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {post.offers.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSkillClick(s)}
              title={`Filter by ${s}`}
              className="rounded-full bg-mint/60 px-2.5 py-0.5 text-xs font-medium text-ink transition-transform hover:scale-105"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Needs Skills */}
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose">
          Looking for
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {post.needs.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSkillClick(s)}
              title={`Filter by ${s}`}
              className="rounded-full border border-dashed border-rose/40 bg-blush/30 px-2.5 py-0.5 text-xs font-medium text-ink transition-transform hover:scale-105"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Reveal Area */}
      <div className="mt-4 pt-2 border-t border-ink/5">
        {isRevealed ? (
          <div className="animate-[up_0.35s_ease_both] rounded-2xl bg-cream/80 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-ink">
                Contact Method
              </p>
              <button
                type="button"
                onClick={() => onToggleReveal(post.id)}
                className="text-xs text-muted-ink hover:text-ink flex items-center gap-1"
              >
                <EyeOff className="size-3" /> Hide
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-medium text-ink truncate select-all">
                {post.contact}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-xl bg-surface px-2.5 py-1 text-xs font-semibold text-rose shadow-2xs hover:bg-surface/80"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-leaf" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onToggleReveal(post.id)}
            className="group flex items-center gap-1.5 text-xs font-bold text-rose transition-colors hover:text-ink"
          >
            <Eye className="size-3.5" />
            <span>Reveal Contact Info</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        )}
      </div>

      {/* Post Actions (Mark fulfilled & Delete) */}
      <div className="mt-3 flex items-center justify-between pt-2 text-xs border-t border-ink/5 text-muted-ink">
        <button
          type="button"
          onClick={() => initiateAction("toggle")}
          className="font-medium hover:text-ink transition-colors"
        >
          {isFulfilled ? "↻ Reopen request" : "✓ Mark fulfilled"}
        </button>

        <button
          type="button"
          onClick={() => initiateAction("delete")}
          aria-label="Delete post"
          className="hover:text-rose transition-colors p-1"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* PIN Verification Modal */}
      {showManageModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-surface p-5 shadow-xl border border-ink/10">
            <h4 className="font-display font-semibold text-base text-ink">
              Creator Verification
            </h4>
            <p className="mt-1 text-xs text-muted-ink">
              This post was created with a PIN. Enter the 4-digit PIN to{" "}
              {actionType === "toggle" ? "update status" : "delete"}.
            </p>
            <input
              type="password"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="mt-3 w-full rounded-xl border border-ink/15 px-3 py-2 text-center font-mono text-sm tracking-widest outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
            {pinError ? (
              <p className="mt-1 text-[11px] font-semibold text-rose">{pinError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="flex-1 rounded-xl border border-ink/10 py-1.5 text-xs font-semibold text-muted-ink hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPinAndExecute}
                className="flex-1 rounded-xl bg-rose py-1.5 text-xs font-semibold text-cream hover:bg-rose/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
