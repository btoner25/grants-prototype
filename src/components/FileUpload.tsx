"use client";

import { useRef, useState } from "react";
import { formatSize } from "@/lib/fileStore";

export const ACCEPTED = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".jpg", ".jpeg", ".png"];
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Accessible multi-file picker. Files are checked for type and size before they
 * are added; nothing is stored until the parent form is submitted.
 */
export default function FileUpload({
  id,
  label,
  hint,
  files,
  onChange,
  error,
  required = false,
  maxFiles = 5,
}: {
  id: string;
  label: string;
  hint?: string;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  required?: boolean;
  maxFiles?: number;
}) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    if (!list) return;
    const added: File[] = [];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      const ext = `.${f.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!ACCEPTED.includes(ext)) problems.push(`${f.name} wasn't added: that file type isn't accepted.`);
      else if (f.size === 0) problems.push(`${f.name} wasn't added: the file is empty.`);
      else if (f.size > MAX_BYTES) problems.push(`${f.name} wasn't added: it is larger than 10 MB.`);
      else if (files.some((x) => x.name === f.name && x.size === f.size)) problems.push(`${f.name} is already attached.`);
      else added.push(f);
    }
    let next = [...files, ...added];
    if (next.length > maxFiles) {
      problems.push(`Only ${maxFiles} files can be attached, so some weren't added.`);
      next = next.slice(0, maxFiles);
    }
    onChange(next);
    const kept = next.length - files.length;
    setMessage(
      [kept > 0 ? `Attached ${kept} file${kept === 1 ? "" : "s"}.` : "", ...problems].filter(Boolean).join(" "),
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(i: number) {
    const name = files[i].name;
    onChange(files.filter((_, k) => k !== i));
    setMessage(`Removed ${name}.`);
    inputRef.current?.focus();
  }

  const describedBy = [`${id}-hint`, error ? `${id}-error` : ""].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-zinc-900">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <p id={`${id}-hint`} className="text-sm text-zinc-700">
        {hint ? `${hint} ` : ""}Accepted: PDF, Word, Excel, CSV, text, JPG or PNG. Up to 10 MB each and{" "}
        {maxFiles} files in total.
      </p>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-800">
          Error: {error}
        </p>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        onChange={(e) => pick(e.target.files)}
        className="block w-full text-sm text-zinc-900 file:mr-4 file:rounded file:border file:border-blue-800 file:bg-white file:px-4 file:py-2 file:font-medium file:text-blue-800 hover:file:bg-blue-50"
      />
      <p role="status" className="text-sm text-zinc-800">{message}</p>
      {files.length > 0 && (
        <ul aria-label={`Attached files: ${label}`} className="mt-1 divide-y divide-zinc-200 rounded border border-zinc-300 bg-white">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="text-zinc-900">
                {f.name} <span className="text-sm text-zinc-600">({formatSize(f.size)})</span>
              </span>
              <button type="button" onClick={() => remove(i)} className="text-sm font-medium text-red-800 underline">
                Remove<span className="sr-only"> {f.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
