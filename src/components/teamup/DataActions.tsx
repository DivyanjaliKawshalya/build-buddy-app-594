import { useRef } from "react";
import { Download, Upload, RotateCcw, FileSpreadsheet } from "lucide-react";
import type { TeamUpPost } from "@/lib/teamup";

interface DataActionsProps {
  posts: TeamUpPost[];
  onImport: (posts: TeamUpPost[]) => void;
  onReset: () => void;
}

export function DataActions({ posts, onImport, onReset }: DataActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportJSON() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `teamup-posts-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Name",
      "Index Number",
      "Course Code",
      "Offers",
      "Needs",
      "Contact",
      "Status",
      "Created At",
    ];
    const rows = posts.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.indexNumber}"`,
      `"${p.courseCode}"`,
      `"${p.offers.join("; ")}"`,
      `"${p.needs.join("; ")}"`,
      `"${p.contact.replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${new Date(p.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `teamup-posts-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImport(parsed as TeamUpPost[]);
        } else {
          alert("Invalid backup file: Root element must be an array of posts.");
        }
      } catch {
        alert("Failed to parse JSON file. Please ensure it is a valid backup.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-muted-ink">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">Persistence Tools:</span>
        <button
          type="button"
          onClick={exportJSON}
          title="Backup posts as JSON"
          className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-surface/80 px-2.5 py-1.5 font-medium text-ink hover:border-ink/20 hover:bg-surface"
        >
          <Download className="size-3 text-leaf" /> Export JSON
        </button>

        <button
          type="button"
          onClick={exportCSV}
          title="Download as spreadsheet CSV"
          className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-surface/80 px-2.5 py-1.5 font-medium text-ink hover:border-ink/20 hover:bg-surface"
        >
          <FileSpreadsheet className="size-3 text-ocean" /> Export CSV
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Restore posts from JSON backup"
          className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-surface/80 px-2.5 py-1.5 font-medium text-ink hover:border-ink/20 hover:bg-surface"
        >
          <Upload className="size-3 text-rose" /> Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              "Reset all posts to default campus demo data? This will clear custom posts from your browser storage.",
            )
          ) {
            onReset();
          }
        }}
        className="inline-flex items-center gap-1 text-muted-ink hover:text-rose transition-colors"
      >
        <RotateCcw className="size-3" /> Reset Demo Data
      </button>
    </div>
  );
}
