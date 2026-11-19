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

## Decisions log

- 2026-11-18: Chose Next.js + Tailwind. Phase 0 setup complete.
- 2026-11-18: Phase 1 mockup built. Fake data lives in `src/lib/data.ts`. Light theme only for now.
  Dynamic pages use `export const instant = false` (Next.js 16 requirement for pages that read the URL).
