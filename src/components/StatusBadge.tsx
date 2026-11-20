// Status is always shown as text; color only reinforces it (WCAG 1.4.1).
const styles: Record<string, string> = {
  Open: "bg-green-100 text-green-900 border-green-300",
  Forecast: "bg-sky-100 text-sky-900 border-sky-300",
  Closed: "bg-zinc-100 text-zinc-800 border-zinc-300",
  Draft: "bg-zinc-100 text-zinc-800 border-zinc-300",
  Submitted: "bg-sky-100 text-sky-900 border-sky-300",
  "In review": "bg-amber-100 text-amber-950 border-amber-300",
  Awarded: "bg-green-100 text-green-900 border-green-300",
  Declined: "bg-zinc-100 text-zinc-800 border-zinc-300",
  "On time": "bg-green-100 text-green-900 border-green-300",
  "Due soon": "bg-amber-100 text-amber-950 border-amber-300",
  Overdue: "bg-red-100 text-red-900 border-red-300",
  Upcoming: "bg-zinc-100 text-zinc-800 border-zinc-300",
  Paid: "bg-green-100 text-green-900 border-green-300",
  "Pending review": "bg-amber-100 text-amber-950 border-amber-300",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? styles.Closed
      }`}
    >
      {status}
    </span>
  );
}
