import Link from "next/link";
import ResetDemoData from "@/components/ResetDemoData";

const roles = [
  {
    href: "/opportunities",
    title: "Applicants",
    body: "Browse open funding opportunities and start an application.",
    cta: "Find grants",
  },
  {
    href: "/grantee",
    title: "Current grantees",
    body: "Sign in to submit progress reports, request payments and upload documents.",
    cta: "Open grantee portal",
  },
  {
    href: "/review",
    title: "Reviewers",
    body: "Declare conflicts of interest, then score assigned applications.",
    cta: "Open review queue",
  },
  {
    href: "/staff",
    title: "Grant program staff",
    body: "See applications in progress, active grants and overdue reports.",
    cta: "Open staff dashboard",
  },
];

export default function Home() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Grants Management Prototype
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-700">
        Click through the grant lifecycle from four points of view. Anything you
        enter is saved only in this web browser.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((r) => (
          <li
            key={r.href}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-zinc-900">{r.title}</h2>
            <p className="mt-2 flex-1 text-zinc-700">{r.body}</p>
            <Link
              href={r.href}
              className="mt-4 inline-block self-start rounded bg-blue-800 px-4 py-2 font-medium text-white hover:bg-blue-900"
            >
              {r.cta}
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="how-to-test" className="mt-12 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 id="how-to-test" className="text-xl font-semibold text-zinc-900">How to test</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-6 text-zinc-800">
          <li>
            <strong>Use one browser on one device for the whole session.</strong> What you enter is
            saved only in your browser. Other testers can&apos;t see it, and it&apos;s lost if you
            clear your browsing data or use a private window.
          </li>
          <li>
            <strong>Play every role yourself.</strong> Switch roles with the menu at the top. For
            example, submit something as a grantee, then review it as staff.
          </li>
          <li>Use made-up information only. Never enter real names, addresses or financial details.</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-zinc-900">A suggested walkthrough</h3>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-6 text-zinc-800">
          <li>
            <strong>Staff:</strong> open the{" "}
            <Link href="/staff/builder" className="text-blue-800 underline">Opportunity builder</Link>,
            start from the sample, and publish it.
          </li>
          <li>
            <strong>Applicant:</strong> find it on{" "}
            <Link href="/opportunities" className="text-blue-800 underline">Find grants</Link> and apply.
          </li>
          <li>
            <strong>Grantee:</strong> sign in to the{" "}
            <Link href="/grantee" className="text-blue-800 underline">Grantee portal</Link> as Pine County
            Housing Trust. Submit the overdue report, then request a payment with a receipt attached.
          </li>
          <li>
            <strong>Staff:</strong> open{" "}
            <Link href="/staff/submissions" className="text-blue-800 underline">Grantee submissions</Link>.
            Request changes on the report, then go back to the grantee side to see what happens.
          </li>
          <li>
            <strong>Reviewer:</strong> score an application in the{" "}
            <Link href="/review" className="text-blue-800 underline">review queue</Link>.
          </li>
        </ol>

        <p className="mt-6 text-zinc-800">
          Notice anything confusing, broken or hard to use with a keyboard or screen reader? Note the
          page and what you expected, and send it to the person who shared this link.
        </p>

        <div className="mt-6 border-t border-zinc-200 pt-6">
          <p className="mb-3 text-zinc-700">Start over by erasing everything you&apos;ve entered.</p>
          <ResetDemoData />
        </div>
      </section>
    </main>
  );
}
