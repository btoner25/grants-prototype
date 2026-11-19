export default function Home() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        Grants Management Prototype
      </h1>
      <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
        A working prototype of a grants management system for the State of
        Minnesota, built to test the requirements in the system specification.
      </p>
      <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
        Coming in Phase 1: funding opportunities, an application form, reviewer
        scoring and a staff dashboard.
      </p>
    </main>
  );
}
