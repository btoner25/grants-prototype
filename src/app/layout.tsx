import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Grants Management Prototype",
    template: "%s | Grants Management Prototype",
  },
  description:
    "Prototype of a grants management system for the State of Minnesota. Fake data only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to main content
        </a>
        <div
          role="note"
          className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950"
        >
          Prototype, not for official use. All data is fictional.
        </div>
        <header className="bg-blue-900 text-white">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              Minnesota Grants <span className="font-normal">(prototype)</span>
            </Link>
            <SiteNav />
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-zinc-700">
            Prototype built to test the grants management system specification.
            No real data is collected or stored.
          </div>
        </footer>
      </body>
    </html>
  );
}
