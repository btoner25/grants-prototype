@AGENTS.md

# Grants Management Prototype

A clickable, working prototype of a grants management system for the State of
Minnesota. It exists to test and refine the requirements in the system
specification before any vendor procurement. It is not the production system.

- Spec: https://claude.ai/artifact/AhRfYrG8wFn3dnGRb3S54D (requirement IDs F-, S-, A-, D-)
- Project plan: https://claude.ai/artifact/Gmd36ot9Qcn7dfgfQorgH6

## Who is building this

The product owner has no coding experience. Claude writes all the code.
- Explain changes in plain English, without jargon.
- Make one feature per change, and say how to check it in the browser.
- After each working change, offer to commit it to Git with a short note.

## Rules (never break these)

- Fake data only. Never add real people, organizations, SSNs, bank details or
  not-public data. Generate realistic fictional data instead.
- No secrets in code. API keys and passwords go in `.env.local`, which Git ignores.
- Every page shows the "Prototype, not for official use" banner (in `src/app/layout.tsx`).
- Accessibility: build to WCAG 2.1 AA from the start. That means semantic HTML,
  labels on every form field, full keyboard use, visible focus, 4.5:1 text contrast,
  and nothing conveyed by color alone.
- Don't add new services, paid tools or packages without explaining why and getting a yes.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS), in `src/app`
- Planned: Supabase (database and sign-in) in Phase 2; Vercel for a private demo link

## Phases

0. Setup (done)
1. Clickable mockup with fake data: opportunities, application form, reviewer scoring, staff dashboard (built; awaiting tester feedback at Gate A)
2. Applicant side: database, sign-in, apply and submit (F-01 to F-04)
3. Review and award (F-05 to F-10)
4. Post-award and closeout (F-11 to F-15)
5. Harden accessibility and security, then demo

## Running it

`npm run dev` in this folder, then open http://localhost:3000.

## Online test site

- Live test site: https://grants-prototype.vercel.app (Vercel project `toner5/grants-prototype`, Hobby plan).
- Code lives in the private GitHub repo https://github.com/btoner25/grants-prototype (branch `main`).
- Vercel CLI is installed globally; run `vercel` commands from PowerShell (the Git Bash shim breaks).
  `.vercel/` and `.env.local` (Vercel's OIDC token) are git-ignored and must stay that way.
- Vercel deploys from that repo. Pushing to `main` updates the live test site automatically, so
  after each commit the user approves, offer to push it (`git push`).
- The site tells search engines not to list it (`next.config.ts` headers and layout metadata).

## Decisions log

- 2026-11-18: Chose Next.js + Tailwind. Phase 0 setup complete.
- 2026-11-18: Phase 1 mockup built. Fake data lives in `src/lib/data.ts`. Light theme only for now.
  Dynamic pages use `export const instant = false` (Next.js 16 requirement for pages that read the URL).
- 2026-11-18: Added the Opportunity builder (`/staff/builder`). Staff create an opportunity, design
  its form (`src/lib/formTypes.ts`), preview it, and publish to Find Grants. Published opportunities
  live at `/grant?id=` and `/grant/apply?id=`, and forms render through `src/components/DynamicForm.tsx`.
  Builder data and applications are stored in browser localStorage (`src/lib/localStore.ts`) until
  Phase 2 adds a database. Every form always includes org info, amount requested and certification.
- 2026-11-19: Added the Grantee portal (`/grantee`). Sign-in is simulated (pick a fictional
  account, no passwords) until Phase 2 adds real auth with MFA. Each grantee sees only their own
  grants (`src/lib/granteeData.ts`) and can submit progress reports and payment requests with
  attachments. Payment requests are blocked while any report is overdue (F-12). Uploaded files are
  stored in browser IndexedDB (`src/lib/fileStore.ts`); type/size limits in `src/components/FileUpload.tsx`.
  Dates from timestamps must use `localDay()` (local time), not `.slice(0, 10)` (UTC).
- 2026-11-19: Added staff review of grantee submissions (`/staff/submissions`). Staff accept a report
  or request changes, and approve or return payment requests, with a comment the grantee sees.
  A report sent back after its due date keeps payments on hold; staff can't approve payments during a
  hold. Approved requests count as paid. The staff dashboard's active grants now come from
  `granteeGrants` plus browser data (the old static `activeGrants` list was removed).
