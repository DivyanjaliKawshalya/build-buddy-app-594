import { z } from "zod";

export const TeamUpPostSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  indexNumber: z
    .string()
    .trim()
    .regex(
      /^([0-9]{7,8}|[A-Za-z]{2,4}\/[0-9]{2}\/[0-9]{4,5})$/,
      "Enter a valid university Index No. (e.g. 23014889 or ICT/22/1234)",
    ),
  courseCode: z
    .string()
    .trim()
    .min(3, "Course code too short")
    .max(10, "Course code too long")
    .regex(
      /^[A-Za-z]{2,5}\s?[0-9]{3,4}$/,
      "Format should be e.g. CS201, ICT2223 or DES 210",
    ),
  offers: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Specify at least one skill you can offer"),
  needs: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Specify at least one skill you need help with"),
  contact: z
    .string()
    .trim()
    .min(4, "Contact information is required")
    .max(100, "Contact cannot exceed 100 characters")
    .refine(
      (val) => {
        // Accepts valid email, or campus email, or phone number with at least 9 digits
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s+\-()]{9,15}$/;
        return emailRegex.test(val) || phoneRegex.test(val);
      },
      {
        message: "Provide a valid email (e.g. name@campus.edu) or phone number",
      },
    ),
  status: z.enum(["OPEN", "FULFILLED"]).default("OPEN"),
  creatorPin: z.string().optional(),
  createdAt: z.number(),
});

export type TeamUpPost = z.infer<typeof TeamUpPostSchema>;

export type PostInput = {
  name: string;
  indexNumber: string;
  courseCode: string;
  offers: string;
  needs: string;
  contact: string;
  creatorPin?: string;
};

export type FieldErrors = Partial<Record<keyof PostInput, string>>;

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
    status: "OPEN",
    createdAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: "seed-2",
    name: "Marco Lindqvist",
    indexNumber: "22077310",
    courseCode: "DES210",
    offers: ["Illustration", "Branding"],
    needs: ["Motion / After Effects"],
    contact: "marco.l@campus.edu",
    status: "OPEN",
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
    status: "OPEN",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "seed-4",
    name: "Theo Baptiste",
    indexNumber: "22091503",
    courseCode: "ENG150",
    offers: ["Essay editing", "Citation help"],
    needs: ["Poetry workshop"],
    contact: "theo.b@campus.edu",
    status: "OPEN",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
];

/**
 * Sanitize basic string input to prevent dangerous characters and HTML injection
 */
export function sanitizeText(val: string): string {
  return val
    .replace(/[<>]/g, "") // strip angle brackets
    .trim();
}

/**
 * Parses comma-separated skills, trims them, removes duplicates and empty entries
 */
export function parseSkills(value: string): string[] {
  const list = value
    .split(",")
    .map((s) => sanitizeText(s))
    .filter(Boolean);
  return Array.from(new Set(list));
}

/**
 * Validate user post input against Zod schema and return structured field errors
 */
export function validatePostInput(input: PostInput): {
  success: boolean;
  errors: FieldErrors;
  data?: Omit<TeamUpPost, "id" | "createdAt">;
} {
  const offers = parseSkills(input.offers);
  const needs = parseSkills(input.needs);

  const raw = {
    name: sanitizeText(input.name),
    indexNumber: sanitizeText(input.indexNumber),
    courseCode: sanitizeText(input.courseCode).toUpperCase().replace(/\s+/g, ""),
    offers,
    needs,
    contact: sanitizeText(input.contact),
    status: "OPEN" as const,
    creatorPin: input.creatorPin?.trim() || undefined,
  };

  const result = TeamUpPostSchema.omit({ id: true, createdAt: true }).safeParse(raw);

  if (!result.success) {
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof PostInput;
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { success: false, errors };
  }

  return { success: true, errors: {}, data: result.data };
}

/**
 * Safely load posts from localStorage with schema validation fallback
 */
export function loadPosts(): TeamUpPost[] {
  if (typeof window === "undefined") return seedPosts;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPosts;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedPosts;

    // Validate each item to ensure legacy/corrupted data doesn't crash the app
    const validated = parsed.map((item) => {
      const parsedItem = TeamUpPostSchema.safeParse({
        ...item,
        status: item.status || "OPEN",
      });
      return parsedItem.success ? parsedItem.data : null;
    }).filter((p): p is TeamUpPost => p !== null);

    return validated.length > 0 ? validated : seedPosts;
  } catch {
    return seedPosts;
  }
}

/**
 * Safely save posts to localStorage
 */
export function savePosts(posts: TeamUpPost[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (err) {
    console.error("Failed to save posts to localStorage:", err);
    return false;
  }
}

/**
 * Clear stored posts and restore baseline seed posts
 */
export function resetToSeedPosts(): TeamUpPost[] {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return [...seedPosts];
}
