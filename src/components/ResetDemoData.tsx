"use client";

import { useState } from "react";
import { clearAllFiles } from "@/lib/fileStore";
import { resetDemoData } from "@/lib/localStore";

/** Lets a tester wipe what they entered and start the walkthrough over. */
export default function ResetDemoData() {
  const [message, setMessage] = useState("");

  async function reset() {
    if (!window.confirm("Erase everything you've entered in this browser and start over? This can't be undone.")) return;
    resetDemoData();
    try {
      await clearAllFiles();
    } catch {
      // Files may already be gone; the rest of the reset still worked.
    }
    setMessage("Demo data erased. You're starting fresh.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={reset}
        className="rounded border border-zinc-500 bg-white px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-100">
        Reset demo data
      </button>
      <p role="status" className="font-medium text-green-900">{message}</p>
    </div>
  );
}
