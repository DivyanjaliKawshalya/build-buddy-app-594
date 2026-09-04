export type TeamUpPost = {
  id: string;
  name: string;
  indexNumber: string;
  courseCode: string;
  offers: string[];
  needs: string[];
  contact: string;
  createdAt: number;
};

const STORAGE_KEY = "teamup.posts.v1";

export const seedPosts: TeamUpPost[] = [
  {
    id: "seed-1",
    name: "Ada Okafor",
    indexNumber: "23014889",
    courseCode: "CS201",
    offers: ["Data viz", "Figma"],
    needs: ["SQL", "Python"],
    contact: "ada@campus.edu",
    createdAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: "seed-2",
    name: "Marco Lindqvist",
    indexNumber: "22077310",
    courseCode: "DES210",
    offers: ["Illustration", "Branding"],
    needs: ["Motion / After Effects"],
    contact: "marco.l@campus.edu · @marcodraws",
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: "seed-3",
    name: "Priya Nair",
    indexNumber: "23022145",
    courseCode: "MATH101",
    offers: ["Statistics", "R"],
    needs: ["Linear algebra"],
    contact: "priya.n@campus.edu",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "seed-4",
    name: "Theo Baptiste",
    indexNumber: "22091503",
    courseCode: "ENG150",
    offers: ["Essay editing", "Citation help"],
    needs: ["Poetry workshop"],
    contact: "theo.b@campus.edu · @theob",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];

export function loadPosts(): TeamUpPost[] {
  if (typeof window === "undefined") return seedPosts;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPosts;
    const parsed = JSON.parse(raw) as TeamUpPost[];
    if (!Array.isArray(parsed)) return seedPosts;
    return parsed;
  } catch {
    return seedPosts;
  }
}

export function savePosts(posts: TeamUpPost[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* storage unavailable — posts stay in memory for this session */
  }
}

export function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
