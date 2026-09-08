# University of Sri Jayewardenepura, Sri Lanka
## Faculty of Technology — Bachelor of Information and Communication Technology Semester 4
### IIC 2223 Web Application Development
### Laboratory Exercise 1 – Part 2: Application Audit, Analysis and Improvement

---

# Application Audit & Defect Catalog

- **Application Title**: TeamUp — Campus Project Teammate Matchmaker
- **Live URL (Part 1)**: https://build-buddy-app-594.lovable.app
- **Baseline Git Branch**: `AI_v1` (Preserved unmodified)
- **Part 2 Git Working Branch**: `APP` (With modular feature/fix branches)
- **Primary Framework**: TanStack Start (Nitro SSR), React 19, TypeScript, Tailwind CSS v4

---

## 1. Problem Addressed & Essential Journey

University group projects frequently require multidisciplinary skill sets (e.g., UI/UX design, database modeling, frontend coding, data analysis). Students often struggle to find classmates with complementary skills who are taking the same course. 

**TeamUp** was built to provide a campus-wide bulletin board where students can:
1. Specify their Course Code (e.g., CS201, DES210, ICT2223).
2. List skills they can offer (e.g., "Figma, React").
3. List skills they need from a teammate (e.g., "SQL, Python").
4. Provide a contact method (email/phone) to connect directly without a heavy registration barrier.

---

## 2. Task 1 — Analysis of the Development Experience (Part 1)

During Part 1, the web application was rapidly generated within a 60-minute window using Lovable (Prompt-to-App AI tool) and TanStack Start. The following practical and learning challenges were experienced:

1. **Illusion of Completeness vs. Mock/Client-Only Logic**:
   - The AI generated a visually stunning UI with custom OKLCH color palettes, smooth hover animations, and micro-interactions. However, functionally, it created a **purely client-side `localStorage` array**.
   - While it appeared to be a collaborative campus board during single-user testing, it had zero network synchronization. A post made on Device A was completely invisible to Device B.
2. **Context Window & Lack of Deep Validation**:
   - The AI prioritized aesthetic layout over data integrity. It generated basic `.trim()` checks, permitting invalid university index formats, bogus emails, and unbounded string lengths that can break the layout.
3. **Framework Complexity & Hidden Dependencies**:
   - TanStack Start with Nitro SSR was chosen by the AI tool. This introduced SSR hydration mismatches: `seedPosts` rendered during server generation, followed by client `localStorage` overwrite in `useEffect`, producing a visible layout shift and hydration flicker.
   - Over 35 unused Radix UI components (accordions, sliders, charts, command palettes) were scaffolded into `src/components/ui/`, resulting in dead code bloat.
4. **Fragility of Follow-up Prompts**:
   - Minor styling prompt adjustments in Lovable risked overwriting route definitions or resetting custom fonts, showing the danger of unconstrained AI generation without strict version control.

---

## 3. Task 2 — Comprehensive Application Audit (Areas A – H)

### Area A: Functional Correctness and Completeness
- **Critical Gap**: No cross-device synchronization or backend persistence. A campus bulletin board must allow classmates to view each other's posts.
- **Missing Requirement**: The core value proposition is "matchmaking by skill", yet the application lacked any search bar or skill-based filtering mechanism. Only a single course dropdown existed.
- **Incomplete Workflow**: Posts could not be edited, deleted, or marked as "Fulfilled / Teammate Found" once pinned.

### Area B: Validation and Error Handling
- **Weak Validation**: Accepted arbitrary strings for Index Numbers (e.g., negative numbers, symbols, random text). USJP index numbers follow specific formats.
- **Email/Contact Format**: Accepted single words or symbols without email/phone format verification.
- **Duplicate Submissions**: Double-clicking "Pin to the board" submitted identical posts multiple times due to absent request debouncing/throttling.
- **Unhelpful Error Messaging**: A single generic warning string was displayed at the bottom of the form without field-level error highlights.

### Area C: Authentication, Authorization, Security and Privacy
- **Zero Authentication / Impersonation**: Because "No login needed" was implemented, any user can type any classmate's name and index number, creating malicious or prank posts without verification.
- **Privacy Leak**: Student index numbers and direct contact details are stored in plain text and rendered without consent confirmation or basic privacy protections.
- **Input Sanitization**: While React escapes JSX strings, lack of input boundary trimming and length constraints leaves the UI vulnerable to Denial of Service via huge payload submissions.

### Area D: Data and Persistence
- **Local Storage Volatility**: Clearing browser cache or switching to incognito immediately deletes all custom posts and resurrects 4 hardcoded dummy seed posts.
- **No Backup / Export Mechanism**: No functionality existed for students or group admins to export posts to JSON/CSV or import existing boards.
- **Hydration Flashes**: Server rendered seed posts flashed on initial page load before `localStorage` was read.

### Area E: Usability, Accessibility, and Responsiveness
- **Accessibility (WCAG 2.1)**: Inputs lacked explicit `<label htmlFor="...">` and `id` bindings, harming screen reader navigation.
- **Feedback & Toasts**: No confirmation toast or visual feedback upon successfully pinning a post.
- **Contact Copying**: Contact details could only be viewed, requiring manual copy-pasting rather than a convenient "Copy to clipboard" action.

### Area F: Performance, Reliability, and Compatibility
- **Heavy Bundle**: Bundles included large unneeded packages (`recharts`, `vaul`, `input-otp`, `embla-carousel-react`) never imported by the application.

### Area G: Code and Architecture Quality
- **Monolithic Component**: `src/routes/index.tsx` was 384 lines long, tightly coupling form handling, filtering, animations, and UI rendering.
- **Dead Code**: Over 35 unused component files in `src/components/ui/`.
- **Underutilized Validation Libraries**: `zod` was already installed in `package.json` but completely omitted in the data layer.

### Area H: Testing Weaknesses
- **Zero Automated Tests**: No unit tests, integration tests, or end-to-end tests existed.

---

## 4. Task 3 — Defect Catalog & Prioritised Defect Table

| ID | Area | Steps / Test Performed | Expected Result | Actual Result | Evidence | Severity | Likely Cause | Fix / Proposed Solution | Retest Result |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **DEF-01** | B. Validation | Entered `abc-xyz` in Index Number field and clicked submit | Field should reject invalid university index number with clear validation error | Post was created and pinned to the board with invalid index number | Form accepted non-numeric / non-index string | **High** | Absence of regex validation in `submit()` function | Implement Zod schema with strict USJP index number regex (`^\d{7,8}$` or `^[A-Z0-9/-]{6,12}$`) | Verified: Rejects invalid format with inline error message |
| **DEF-02** | B. Validation | Entered `not-an-email` in Contact field and clicked submit | Input rejected unless it is a valid email address or phone number | Post was pinned with invalid contact string | Post appeared with `not-an-email` as contact | **High** | Only checked `!contact.trim()`, no format check | Implement Zod email/phone format validation | Verified: Rejects invalid contact string |
| **DEF-03** | B. Validation | Rapidly clicked "Pin to the board" button 4 times | Exactly one post created; button disabled during processing | 4 duplicate identical posts pinned to board simultaneously | 4 identical cards appeared on board | **Medium** | Form submit handler lacked `isSubmitting` throttle state | Add submission lock state and disable submit button while processing | Verified: Button disables, preventing duplicate entries |
| **DEF-04** | A. Functional | Looked for a way to search posts by specific skills (e.g. "Python") | User can type skill name or click a skill badge to view matching posts | No search input or skill filter exists; only course dropdown | Only course filter dropdown present | **High** | AI only implemented course dropdown in Part 1 | Add global search bar for skills (offers & needs) and interactive filter tags | Verified: Search bar and skill pills instantly filter board |
| **DEF-05** | A. Functional | Attempted to mark a post as resolved after finding a teammate | User can mark post as "Fulfilled" or delete their own post | No status toggle, delete, or edit option exists | Posts remain on board indefinitely | **Medium** | Missing post lifecycle state in data model | Add `status: 'OPEN' \| 'FULFILLED'` and creator passkey / delete action | Verified: Posts can be marked fulfilled or deleted with confirmation |
| **DEF-06** | D. Persistence | Clicked browser refresh / loaded in another tab | Posts should persist, and can be backed up to file | Data is trapped in browser localStorage with no export | No backup/export options | **Medium** | Absence of data import/export utility | Implement Export to JSON and Import from JSON backup utilities | Verified: Posts can be exported and imported with 1 click |
| **DEF-07** | E. Usability / a11y | Audited form fields with accessibility inspection | Each `<input>` should have matching `<label htmlFor="id">` | `<input>` tags wrapped in generic `<span>` with no `id` attributes | Inspect element shows no `id`/`for` link | **Medium** | Rapid AI generation omitted explicit WAI-ARIA / semantic attributes | Add explicit `id` and `htmlFor` to all form controls | Verified: Accessibility audit passes |
| **DEF-08** | E. Usability | Submitted a valid post to the board | Clear confirmation feedback (e.g. Toast) informing user of success | Page just scrolls; no feedback message or toast | No toast triggered | **Low** | Absence of notification library integration | Integrate `sonner` toast for post creation, copy contact, and errors | Verified: Sonner toast appears with haptic feedback |
| **DEF-09** | E. Usability | Clicked "Reveal contact" and attempted to copy | Quick "Copy to clipboard" button to copy email without highlighting | Contact displayed as raw text without quick copy button | User must manually select text | **Low** | Missing copy-to-clipboard micro-interaction | Add "Copy" button with automatic clipboard write and toast feedback | Verified: Click-to-copy works with toast confirmation |
| **DEF-10** | G. Architecture | Inspected `src/lib/teamup.ts` and `src/routes/index.tsx` | Clean separation between validation schema, storage service, and UI components | Monolithic 384-line component mixing UI, form state, and persistence | Giant `index.tsx` file | **Medium** | Prompt-to-app generator dumped all logic into single route file | Refactor data layer into validated Zod service module | Verified: Code modularized with type safety |
| **DEF-11** | H. Testing | Inspected test setup in repository | Automated test suite verifying validation and storage logic | Zero test files exist in the repository | No `*.test.ts` files | **High** | AI generator did not generate test specifications | Add comprehensive unit test suite using Vitest / Bun test | Verified: 100% test pass rate |
