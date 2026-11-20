"use client";

import { useState } from "react";
import { downloadAttachment, formatSize } from "@/lib/fileStore";
import type { Attachment } from "@/lib/granteeData";

/** A download button for one stored attachment. */
export default function AttachmentDownload({ a }: { a: Attachment }) {
  const [problem, setProblem] = useState("");
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="text-blue-800 underline"
        onClick={() =>
          downloadAttachment(a).then(
            () => setProblem(""),
            () => setProblem("This file is no longer stored in this browser."),
          )
        }
      >
        Download<span className="sr-only"> {a.name}</span>
      </button>
      <span className="text-sm text-zinc-600">({formatSize(a.size)})</span>
      {problem && <span role="alert" className="text-sm text-red-800">{problem}</span>}
    </span>
  );
}
