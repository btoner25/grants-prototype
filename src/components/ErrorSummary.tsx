"use client";

/** A list of form errors that links to each field (shown above the form on submit). */
export default function ErrorSummary({
  items,
  ref,
}: {
  items: { target: string; message: string }[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  if (items.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="error-summary-title"
      className="rounded-lg border-2 border-red-700 bg-red-50 p-4">
      <h3 id="error-summary-title" className="text-lg font-semibold text-red-900">
        There {items.length === 1 ? "is 1 problem" : `are ${items.length} problems`} to fix
      </h3>
      <ul className="mt-2 list-disc pl-6">
        {items.map((i) => (
          <li key={i.target}>
            <a href={`#${i.target}`} className="text-red-900 underline">{i.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="text-sm font-medium text-red-800">
      Error: {message}
    </p>
  );
}
