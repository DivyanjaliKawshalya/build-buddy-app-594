import { describe, expect, it } from "bun:test";
import {
  parseSkills,
  sanitizeText,
  validatePostInput,
  TeamUpPostSchema,
  seedPosts,
} from "./teamup";

describe("TeamUp Validation & Security Suite", () => {
  it("should sanitize dangerous HTML tags and scripts", () => {
    const raw = "<script>alert('xss')</script>Ada Okafor";
    const cleaned = sanitizeText(raw);
    expect(cleaned).not.toContain("<");
    expect(cleaned).not.toContain(">");
    expect(cleaned).toBe("scriptalert('xss')/scriptAda Okafor");
  });

  it("should parse comma-separated skills and deduplicate them", () => {
    const skillsString = "Python, Figma, Python, React , , SQL";
    const parsed = parseSkills(skillsString);
    expect(parsed).toEqual(["Python", "Figma", "React", "SQL"]);
    expect(parsed.length).toBe(4);
  });

  it("should successfully validate a properly formatted student post", () => {
    const validPost = {
      name: "Kasun Perera",
      indexNumber: "23014889",
      courseCode: "CS201",
      offers: "React, Node.js",
      needs: "Figma, UI Design",
      contact: "kasun.p@campus.edu",
    };

    const result = validatePostInput(validPost);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.courseCode).toBe("CS201");
    expect(result.data?.offers).toEqual(["React", "Node.js"]);
    expect(result.data?.needs).toEqual(["Figma", "UI Design"]);
  });

  it("should reject invalid university index numbers (DEF-01)", () => {
    const invalidPost = {
      name: "Kasun Perera",
      indexNumber: "invalid_index_123",
      courseCode: "CS201",
      offers: "React",
      needs: "SQL",
      contact: "kasun@campus.edu",
    };

    const result = validatePostInput(invalidPost);
    expect(result.success).toBe(false);
    expect(result.errors.indexNumber).toBeDefined();
    expect(result.errors.indexNumber).toContain("valid university Index No");
  });

  it("should reject invalid email or phone contact format (DEF-02)", () => {
    const invalidPost = {
      name: "Kasun Perera",
      indexNumber: "23014889",
      courseCode: "CS201",
      offers: "React",
      needs: "SQL",
      contact: "just-a-random-string",
    };

    const result = validatePostInput(invalidPost);
    expect(result.success).toBe(false);
    expect(result.errors.contact).toBeDefined();
    expect(result.errors.contact).toContain("valid email");
  });

  it("should accept valid Sri Lankan phone numbers for contact", () => {
    const phonePost = {
      name: "Nuwan Silva",
      indexNumber: "23014890",
      courseCode: "ICT2223",
      offers: "Machine Learning",
      needs: "Django",
      contact: "+94771234567",
    };

    const result = validatePostInput(phonePost);
    expect(result.success).toBe(true);
    expect(result.data?.contact).toBe("+94771234567");
  });

  it("should ensure all seed posts adhere to TeamUpPostSchema", () => {
    for (const post of seedPosts) {
      const parsed = TeamUpPostSchema.safeParse(post);
      expect(parsed.success).toBe(true);
    }
  });
});
