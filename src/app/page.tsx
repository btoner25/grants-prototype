import Link from "next/link";

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
    </main>
  );
}
