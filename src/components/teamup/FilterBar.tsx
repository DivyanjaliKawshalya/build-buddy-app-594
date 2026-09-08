import { Search, X, Filter } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCourse: string;
  onCourseChange: (c: string) => void;
  courses: string[];
  selectedSkill: string | null;
  onSkillSelect: (skill: string | null) => void;
  popularSkills: string[];
  statusFilter: "ALL" | "OPEN" | "FULFILLED";
  onStatusFilterChange: (s: "ALL" | "OPEN" | "FULFILLED") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  courses,
  selectedSkill,
  onSkillSelect,
  popularSkills,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/10 bg-surface/70 p-5 backdrop-blur-xl shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-ink" />
          <input
            id="search-posts"
            type="text"
            placeholder="Search by skill (e.g. Python, Figma), name or course..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-ink/10 bg-surface/80 py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition-all focus:border-rose/50 focus:ring-2 focus:ring-rose/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-ink hover:text-ink"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="course-select" className="sr-only">
            Filter by course
          </label>
          <div className="flex items-center gap-1.5 rounded-2xl border border-ink/10 bg-surface/80 px-3 py-2 text-sm">
            <Filter className="size-3.5 text-muted-ink" />
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              className="cursor-pointer bg-transparent font-medium outline-none text-ink text-xs sm:text-sm"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-2xl border border-ink/10 bg-surface/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onStatusFilterChange("ALL")}
              className={`rounded-xl px-2.5 py-1 transition-colors ${
                statusFilter === "ALL"
                  ? "bg-ink text-cream"
                  : "text-muted-ink hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("OPEN")}
              className={`rounded-xl px-2.5 py-1 transition-colors ${
                statusFilter === "OPEN"
                  ? "bg-leaf text-cream"
                  : "text-muted-ink hover:text-ink"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("FULFILLED")}
              className={`rounded-xl px-2.5 py-1 transition-colors ${
                statusFilter === "FULFILLED"
                  ? "bg-muted-ink text-cream"
                  : "text-muted-ink hover:text-ink"
              }`}
            >
              Filled
            </button>
          </div>
        </div>
      </div>

      {/* Popular Skill Pills */}
      {popularSkills.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
            Filter by skill:
          </span>
          {popularSkills.map((skill) => {
            const isSelected = selectedSkill?.toLowerCase() === skill.toLowerCase();
            return (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillSelect(isSelected ? null : skill)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-rose text-cream shadow-xs"
                    : "bg-surface/90 border border-ink/10 text-ink/80 hover:border-rose/40 hover:text-rose"
                }`}
              >
                {skill}
                {isSelected ? " ✕" : ""}
              </button>
            );
          })}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="ml-auto text-xs font-semibold text-rose hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
