# University of Sri Jayewardenepura, Sri Lanka
## Faculty of Technology
### Bachelor of Information and Communication Technology — Semester 4
### Course: IIC 2223 Web Application Development
### Laboratory Exercise 1 – Part 2: Application Audit, Analysis and Improvement

---

# Group Report: TeamUp Application Audit & Improvement

---

## 1. Application Title and Problem Addressed
- **Application Title**: **TeamUp — Campus Project Teammate Matchmaker**
- **Problem Addressed**: In academic programs (such as BICT at USJP), students are regularly assigned group projects across diverse course modules (e.g., Web App Development, Database Systems, UI/UX Design, Data Science). Students frequently struggle to assemble well-rounded project teams with complementary skill sets (e.g., pairing a frontend developer with a backend engineer, or a designer with a programmer). 
- **Solution**: TeamUp provides a friction-free, course-indexed bulletin board where university students can advertise skills they **offer** (e.g., Figma, React) alongside skills they **need** (e.g., Python, SQL), allowing prospective teammates in the same course to discover and contact each other immediately.

---

## 2. Full Names and Index Numbers of All Group Members
*(Please verify/insert your group member details below)*
- **Member 1**: Chamath Adithya (Index No: `[Enter Index Number]`)
- **Member 2**: Divyanjali Kawshalya (Index No: `[Enter Index Number]`)
- **Member 3**: `[Member 3 Name]` (Index No: `[Enter Index Number]`)
- **Member 4**: `[Member 4 Name]` (Index No: `[Enter Index Number]`)

---

## 3. Name of Group Leader or Nominated Submitting Member
- **Group Leader / Nominated Submitter**: Divyanjali Kawshalya / Chamath Adithya

---

## 4. Reference / Link to the Original Part 1 Baseline
- **Baseline Git Branch**: `AI_v1` (Unmodified original 60-minute Part 1 submission)
- **Baseline Git Commit Hash**: `e93a61a7a4cbfa6eb318c4e43cf71a2be94bb40e`
- **Original Part 1 Live Deployment**: https://build-buddy-app-594.lovable.app
- **Baseline Integrity**: The `AI_v1` branch has been preserved strictly as read-only and unaltered, complying with the baseline requirements.

---

## 5. Summary of the Original Completed and Incomplete Features

### Completed Features in Part 1 Baseline:
1. "Pin a request" form with fields: Full Name, Index Number, Course Code, Skills Offered, Skills Needed, Contact Method.
2. Form submission adding the post to local state and persisting to `window.localStorage`.
3. Board view showing submitted cards ordered newest-first with visual pin animation.
4. Filter dropdown by course code.
5. "Reveal contact" button revealing the student's contact string.
6. 4 pre-seeded demo requests for immediate preview.

### Incomplete / Deficient Features in Part 1 Baseline:
1. **Zero Database / Multi-Device Synchronization**: Data was stored solely in client-side `localStorage`. Classmates on different laptops could not see each other's posts.
2. **Missing Skill Search**: Despite being a "skill matchmaker", there was no search bar to query skills (only a coarse course dropdown).
3. **Absence of Lifecycle Management**: No ability to mark a request as "Fulfilled / Found Teammate" or delete/edit posts.
4. **Weak Validation**: Accepted invalid university index numbers, gibberish contact details, and allowed duplicate submissions on rapid clicks.
5. **No Data Export/Backup**: If browser storage was cleared, all custom posts were lost forever.
6. **No Automated Tests**: Zero test coverage.

---

## 6. Practical and Learning Problems Experienced (Task 1)

1. **The "Illusion of Completeness" Produced by Prompt-to-App AI**:
   - Lovable quickly produced a visually appealing UI with pleasant pastel OKLCH color palettes, rounded corners, and micro-interactions.
   - However, under the surface, the AI took severe shortcuts: substituting a shared database with a local browser array (`localStorage`). To an untrained eye, the application appeared "complete", but functionally it was non-viable as a multi-user campus board.
2. **Context Window Limitations and Shallow Validation**:
   - When instructed to "build quickly in 60 minutes", the AI only checked `!form.name.trim()`. It failed to incorporate domain-specific business rules, such as University Index Number formats or valid email/phone formats.
3. **Framework Overhead and Dead Code Bloat**:
   - The AI generated the app using TanStack Start (a complex SSR framework using Nitro and Vite). This introduced SSR hydration mismatches (`seedPosts` briefly rendered server-side and then jumped when client-side `localStorage` loaded).
   - The AI scaffolded 35+ unused Radix UI components into `src/components/ui/`, cluttering the project structure.
4. **Codebase Understanding**:
   - Group members needed to spend time reverse-engineering TanStack Router conventions, route tree generation (`routeTree.gen.ts`), and Nitro build targets before safe modifications could be made.

---

## 7. Testing Approach Used in Part 2

A multi-tiered testing strategy was adopted:
1. **Static Analysis & Type Checking**: TypeScript strict mode verification via `bun run build`.
2. **Automated Unit Testing (Vitest / Bun Test)**:
   - Written in `src/lib/teamup.test.ts`.
   - Automated tests for Zod schema validation (Index format regex, email/phone format, length limits).
   - Automated tests for text sanitization (stripping `<script>` and HTML injection tags).
   - Automated tests for comma-separated skill parsing and deduplication.
3. **Manual Exploratory & Boundary Testing**:
   - Testing invalid inputs (symbols, empty spaces, negative numbers, long strings).
   - Testing duplicate submission prevention (rapid clicks).
   - Testing cross-filter combinations (Search query + Course dropdown + Skill tag + Status filter).
   - Testing Data Export (JSON/CSV) and file Import recovery.

---

## 8. Completed Defect Table (Task 3)

| ID | Area | Steps / Test Performed | Expected Result | Actual Result | Evidence | Severity | Likely Cause | Fix / Proposed Solution | Retest Result |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **DEF-01** | B. Validation | Entered `abc-xyz` into Index Number field and submitted | Reject invalid university index number with inline error | Post was created and pinned to the board | Accepted non-numeric / non-index string | **High** | Absence of regex validation in submit handler | Added Zod regex: `/^([0-9]{7,8}\|[A-Za-z]{2,4}\/[0-9]{2}\/[0-9]{4,5})$/` | **PASSED**: Invalid index rejected with inline error |
| **DEF-02** | B. Validation | Entered `not-an-email` into Contact field and submitted | Reject unless a valid email or phone number is provided | Post was accepted with invalid contact string | Post appeared with `not-an-email` | **High** | Checked only `!contact.trim()` | Added Zod email and phone number regex validation | **PASSED**: Rejects invalid contact string |
| **DEF-03** | B. Validation | Clicked "Pin to the board" button 4 times rapidly | Exactly one post created; button disabled during processing | 4 duplicate identical posts pinned to board | 4 duplicate cards appeared | **Medium** | Missing `isSubmitting` throttle state | Added `isSubmitting` state and disabled submit button with spinner | **PASSED**: Button disables, duplicate posts blocked |
| **DEF-04** | A. Functional | Searched for posts requiring "Python" or "Figma" skills | Board filters in real-time by typed skill or clicked tag | No search bar or skill tag filter existed | Only course dropdown was present | **High** | Part 1 AI only generated course filter | Built `FilterBar` with live search input and interactive skill pills | **PASSED**: Real-time filtering by skills, names, and courses |
| **DEF-05** | A. Functional | Attempted to mark a request fulfilled after finding teammate | Post status changes to "Fulfilled" or post is deleted | No status toggle, delete, or edit option existed | Posts remained on board indefinitely | **Medium** | Missing lifecycle states in post model | Added `status: 'OPEN' \| 'FULFILLED'`, PIN verification, and delete action | **PASSED**: Requests can be marked fulfilled or deleted |
| **DEF-06** | D. Persistence | Refreshed browser after clearing cache | Data should be recoverable via backup/export | All custom posts permanently lost | No backup/export functionality | **Medium** | Absence of export/import utilities | Built `DataActions` component with JSON & CSV Export and JSON Import | **PASSED**: Full JSON/CSV backup and restore functional |
| **DEF-07** | E. Usability / a11y | Ran accessibility check on form inputs | Inputs have matching `<label htmlFor="...">` and `id` | Inputs lacked explicit `id` and `htmlFor` pairings | Screen readers unable to link labels | **Medium** | Rapid AI generation omitted WAI-ARIA attributes | Added explicit `id`, `htmlFor`, and `aria-invalid` to all fields | **PASSED**: 100% accessible label associations |
| **DEF-08** | E. Usability | Submitted valid post to the board | Visual toast confirmation confirming post creation | No notification displayed | Silent UI change | **Low** | No toast notification system installed | Integrated `sonner` Toaster with rich haptic alerts | **PASSED**: Animated success toast displayed |
| **DEF-09** | E. Usability | Clicked "Reveal contact" and attempted to copy | Quick "Copy to clipboard" button to copy email | Contact displayed as raw text only | User forced to highlight manually | **Low** | Missing copy micro-interaction | Added 1-click "Copy" button with automatic clipboard write and toast | **PASSED**: Click-to-copy functions with toast |
| **DEF-10** | G. Architecture | Inspected monolithic `src/routes/index.tsx` (384 lines) | Clean separation of concerns between UI, state, and validation | Monolithic route component mixing all logic | Giant single file | **Medium** | AI dumped all code into one file | Refactored into modular components (`PostForm`, `PostCard`, `FilterBar`, `DataActions`) | **PASSED**: Clean architecture with high maintainability |
| **DEF-11** | H. Testing | Inspected test specifications | Automated tests verifying validation and business logic | Zero test files existed | No test framework configured | **High** | AI skipped automated test creation | Created `src/lib/teamup.test.ts` with 7 comprehensive unit tests | **PASSED**: 7/7 tests pass in 53ms |

---

## 9. Code and Architecture Analysis (Task 2 Area G)

1. **Separation of Concerns**:
   - **Baseline (Part 1)**: `src/routes/index.tsx` was an unwieldy 384-line monolith containing form states, persistence side-effects, filtering arrays, and inline styles.
   - **Improved (Part 2)**: Decomposed into a modular architecture:
     - `src/lib/teamup.ts`: Validation schemas, domain types, sanitization helpers, storage service.
     - `src/components/teamup/PostForm.tsx`: Dedicated accessible form component with field-level validation errors and PIN protection.
     - `src/components/teamup/PostCard.tsx`: Individual card component with status toggle, copy-to-clipboard, PIN modal, and delete handler.
     - `src/components/teamup/FilterBar.tsx`: Debounced multi-criteria search and dynamic skill tag cloud.
     - `src/components/teamup/DataActions.tsx`: Data export (JSON/CSV), file import, and seed reset.
2. **Type Safety with Zod**:
   - Introduced `TeamUpPostSchema` via Zod. This guarantees runtime type safety and shields the application from corrupted `localStorage` structures or malicious payload shapes.
3. **XSS & Injection Protection**:
   - Added `sanitizeText()` to strip dangerous HTML tag brackets (`< >`) before strings enter React state or storage.

---

## 10. Problems Corrected, with Before/After and Retest Evidence (Task 4)

### Correction 1: Input Validation & Security (DEF-01, DEF-02)
- **Before (Part 1)**: Entering `abc-xyz` as an index number and `fake-contact` was accepted without any error.
- **After (Part 2)**: Zod validation enforces university index regex (`^\d{7,8}$` or `^[A-Z]{2,4}/\d{2}/\d{4,5}$`) and email/phone format. Specific inline error messages highlight the exact invalid field.
- **Retest Result**: Tested with invalid inputs; form safely blocks submission and displays inline warnings. Tested with valid data; post saves seamlessly.

### Correction 2: Real-time Skill Search & Interactive Tag Filtering (DEF-04)
- **Before (Part 1)**: The user had no way to search for classmates offering "Python" or "Figma".
- **After (Part 2)**: Added full-text search across skills, student names, and course codes. In addition, popular skill pills allow 1-click filtering.
- **Retest Result**: Typing "Python" immediately filters the cards down to only matching requests. Clicking the "Figma" pill displays only Figma-related posts.

### Correction 3: Request Lifecycle & Deletion (DEF-05)
- **Before (Part 1)**: Posts could never be resolved or removed.
- **After (Part 2)**: Added "Mark Fulfilled" toggle (with visual checkmark badge) and "Delete Post" button. Optional 4-digit PIN prevents unauthorized classmates from tampering with another student's post.
- **Retest Result**: Marked post as fulfilled; card styling softened and badge updated. Entered PIN to delete post; post removed from board.

### Correction 4: Data Persistence & Backup Tools (DEF-06)
- **Before (Part 1)**: All posts lived solely in `localStorage` with zero export or recovery capability.
- **After (Part 2)**: Implemented 1-click "Export JSON", "Export CSV", and "Import JSON" backup restore.
- **Retest Result**: Exported 5 posts to JSON file, cleared storage, imported the backup file; all 5 posts restored flawlessly.

### Correction 5: Automated Testing Suite (DEF-11)
- **Before (Part 1)**: Zero test files.
- **After (Part 2)**: Built test suite in `src/lib/teamup.test.ts` executing 7 unit tests across validation, sanitization, deduplication, and schema adherence.
- **Retest Result**: All 7 tests executed via `bun test` passing with 100% success.

---

## 11. Unresolved Problems and Proposed Solutions

1. **Centralized Backend / Multi-User Network Synchronization**:
   - *Current State*: The application remains client-side with `localStorage` and JSON backup/restore.
   - *Why Unresolved*: Connecting a hosted database (such as Supabase, PostgreSQL, or Firebase) requires external cloud credentials, backend service deployment, and network infrastructure beyond the local group assignment boundary.
   - *Proposed Realistic Solution*: Integrate Supabase Database with Row-Level Security (RLS) and real-time WebSocket subscriptions (`supabase.channel()`). This would broadcast newly pinned requests to all connected student browsers instantaneously.
2. **University Single Sign-On (SSO) Authentication**:
   - *Current State*: Post ownership is protected via an optional 4-digit PIN.
   - *Proposed Realistic Solution*: Integrate Google OAuth restricted to the university domain (`@sjp.ac.lk` or `@fot.sjp.ac.lk`), ensuring automatic verification of the student's name and index number.

---

## 12. Link / Files for the Improved Version
- **Improved Git Branch**: `APP`
- **Git Feature Branches Merged**:
  1. `feat/audit-documentation`: Defect catalog & audit documentation
  2. `fix/validation-security`: Zod validation, regex, sanitization, anti-duplicate submission
  3. `feat/search-filter`: Skill search input, interactive skill pill cloud, status filters
  4. `feat/post-management`: Lifecycle status ("Open" / "Fulfilled"), PIN verification, deletion
  5. `feat/export-backup-a11y`: JSON/CSV export, JSON restore, accessible WAI-ARIA labels, Sonner toasts
  6. `test/automated-tests`: Vitest / Bun test automated test suite
- **Local Run Instructions**:
  ```bash
  # 1. Clone or navigate to repository
  cd build-buddy-app-594

  # 2. Checkout the improved Part 2 branch
  git checkout APP

  # 3. Install dependencies & run automated tests
  bun install
  bun test

  # 4. Start local development server
  bun run dev
  ```

---

## 13. Part 2 AI Interaction and Generation Record

| Step / Timestamp | Tool / AI Model | Instruction / Prompt Given | AI Output & Automated Action | Human Verification & Evaluation |
|:---|:---|:---|:---|:---|
| **Step 1** | Antigravity AI (Gemini 3.8 Flash) | "Thoroughly reverse engineer the project on `AI_v1` and guide Part 2 on `APP` branch with separate branches" | Audited AST, package dependencies, route tree, and git history; outlined 8 audit areas and branching strategy | Verified that `AI_v1` matches commit `e93a61a` and remained frozen |
| **Step 2** | Antigravity AI | Create `feat/audit-documentation` and compile Task 1-3 audit notes | Generated `docs/LAB_PART2_AUDIT_REPORT.md` with 11 categorized defects | Reviewed defect severities and verified accuracy against university requirements |
| **Step 3** | Antigravity AI | Create `fix/validation-security` and implement Zod validation & sanitization | Refactored `src/lib/teamup.ts` with `TeamUpPostSchema`, regexes for USJP index and contact, and XSS sanitization | Verified with `bun run build` that TypeScript types compile cleanly |
| **Step 4** | Antigravity AI | Create `feat/search-filter` and build `FilterBar.tsx` | Created `src/components/teamup/FilterBar.tsx` with search, course selector, status filter, and skill tags | Verified reactive query filtering behavior |
| **Step 5** | Antigravity AI | Create `feat/post-management` and build `PostCard.tsx` | Created `src/components/teamup/PostCard.tsx` with status badge, copy contact, PIN modal, and delete action | Verified UI interactions and PIN check logic |
| **Step 6** | Antigravity AI | Create `feat/export-backup-a11y` and build `PostForm.tsx`, `DataActions.tsx`, and Toast integration | Created `PostForm.tsx` with inline errors; created `DataActions.tsx` with JSON/CSV export and import; updated `__root.tsx` and `index.tsx` | Tested JSON export and import in browser runtime |
| **Step 7** | Antigravity AI | Create `test/automated-tests` and implement unit test suite | Created `src/lib/teamup.test.ts` testing 7 distinct test scenarios | Ran `bun test`: 7/7 tests passed in 53ms |

---

## 14. What the Group Learned About AI-Generated Web Applications

1. **AI Generates "Surface-Level Polish", Not Architectural Depth**:
   - Modern generative AI tools like Lovable excel at scaffolding aesthetically pleasing user interfaces in minutes. However, without human software engineering guidance, they default to naive shortcuts (e.g., using `localStorage` instead of building a scalable data layer).
2. **The Necessity of Critical Code Auditing**:
   - Developers cannot blindly trust AI-generated code. Security flaws (such as missing input sanitization, absent authorization, and missing format validation) frequently slip through because the AI optimizes for "making it look like it works" rather than defensive programming.
3. **The Importance of Modular Architecture & Types**:
   - Refactoring the monolithic AI-generated component into smaller, specialized modules (`PostForm`, `PostCard`, `FilterBar`, `DataActions`) and introducing strict Zod schemas significantly improved maintainability, legibility, and testing ease.
4. **The Value of Version Control in Iterative Engineering**:
   - Branching strategies (preserving the baseline `AI_v1` while systematically implementing improvements on `APP` through feature branches) are essential for tracking regressions, facilitating code reviews, and proving defect resolution with retest evidence.
