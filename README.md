# TeamUp — Campus Project Teammate Matchmaker
## University of Sri Jayewardenepura | Faculty of Technology
### BICT Semester 4 — IIC 2223 Web Application Development
### Laboratory Exercise 1 – Part 2: Application Audit, Analysis and Improvement

---

## 📌 Project Overview

**TeamUp** is a campus matchmaker web application designed for university students to find group project teammates with complementary skill sets. Students can specify course codes (e.g. `CS201`, `ICT2223`), advertise skills they **offer**, list skills they **need**, and directly connect with classmates.

- **Part 1 Baseline Branch**: `AI_v1` *(Preserved 100% frozen as submitted at the 60-minute mark)*
- **Part 2 Improved Branch**: `APP` *(Comprehensive audit, defect resolution, modular architecture, and automated tests)*
- **Documentation**: 
  - [Full 14-Section Group Report](file:///home/chamath-adithya/Documents/build-buddy-app-594/docs/LAB_PART2_FINAL_REPORT.md)
  - [Technical Defect Audit Report](file:///home/chamath-adithya/Documents/build-buddy-app-594/docs/LAB_PART2_AUDIT_REPORT.md)

---

## 🌿 Git Branch Architecture

In compliance with the assignment instructions, all corrections are maintained in modular branches and integrated into `APP`:

| Branch Name | Primary Purpose / Feature | Defects Addressed |
|:---|:---|:---|
| **`AI_v1`** | **Original Part 1 Baseline (Frozen)** | Baseline reference |
| **`feat/audit-documentation`** | Tasks 1, 2, 3 Audit documentation & defect catalog | Audit baseline |
| **`fix/validation-security`** | Zod schema validation, USJP index regex, contact regex, anti-XSS | DEF-01, DEF-02, DEF-03 |
| **`feat/search-filter`** | Live skill search, interactive skill pills, course & status filtering | DEF-04 |
| **`feat/post-management`** | Post status lifecycle ("Open"/"Fulfilled"), 4-digit PIN, post deletion | DEF-05 |
| **`feat/export-backup-a11y`** | JSON/CSV data export, JSON import, WAI-ARIA labels, Sonner toasts | DEF-06, DEF-07, DEF-08, DEF-09, DEF-10 |
| **`test/automated-tests`** | Automated unit test suite with 100% pass rate (`teamup.test.ts`) | DEF-11 |
| **`APP`** | **Master Integration Branch** (All features merged cleanly) | Complete solution |

---

## 🚀 Key Improvements in Part 2

1. **Strict Input Validation & Security (Zod)**:
   - Enforces USJP index number regex (e.g. `23014889` or `ICT/22/101`).
   - Validates email and phone number formats.
   - Sanitizes text inputs to prevent HTML/XSS injection.
   - Disables submit button during processing to prevent duplicate submissions.

2. **Real-time Skill Search & Interactive Tag Filtering**:
   - Search bar searches across skills offered, skills needed, student names, and courses.
   - 1-click popular skill pill tags (e.g. `Python`, `Figma`, `React`, `SQL`) filter the board instantly.

3. **Request Lifecycle & Post Management**:
   - Mark requests as "Open" or "Fulfilled" (Teammate Found).
   - Optional 4-digit Creator PIN protects posts so only the creator can edit or delete them.
   - 1-click "Copy Contact" micro-interaction with toast confirmation.

4. **Data Persistence & Portability**:
   - 1-click Export to **JSON** and **CSV**.
   - Import existing backup JSON files with schema validation.
   - Reset to initial campus demo data option.

5. **Accessibility (a11y) & UX Polish**:
   - Accessible WAI-ARIA form controls (`htmlFor`, `id`, `aria-invalid`).
   - Animated toast notifications via `sonner`.

6. **Automated Testing Suite**:
   - Comprehensive test specifications in `src/lib/teamup.test.ts`.

---

## 🛠️ Getting Started Locally

```bash
# 1. Clone or navigate to the repository
git clone https://github.com/DivyanjaliKawshalya/build-buddy-app-594.git
cd build-buddy-app-594

# 2. Switch to the Part 2 branch
git checkout APP

# 3. Install dependencies
bun install   # or npm install

# 4. Run automated unit tests
bun test      # or npm test

# 5. Start the local development server
bun run dev   # or npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Running Automated Tests

```bash
bun test
```
**Result**:
```
✓ TeamUp Validation & Security Suite > should sanitize dangerous HTML tags and scripts
✓ TeamUp Validation & Security Suite > should parse comma-separated skills and deduplicate them
✓ TeamUp Validation & Security Suite > should successfully validate a properly formatted student post
✓ TeamUp Validation & Security Suite > should reject invalid university index numbers (DEF-01)
✓ TeamUp Validation & Security Suite > should reject invalid email or phone contact format (DEF-02)
✓ TeamUp Validation & Security Suite > should accept valid Sri Lankan phone numbers for contact
✓ TeamUp Validation & Security Suite > should ensure all seed posts adhere to TeamUpPostSchema

 7 pass, 0 fail (22 assertions) [29ms]
```
