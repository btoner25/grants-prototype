import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Grants Management Prototype",
  description:
    "Prototype of a grants management system for the State of Minnesota. Fake data only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline focus:outline-2"
        >
          Skip to main content
        </a>
        <div
          role="note"
          className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950"
        >
          Prototype, not for official use. All data is fictional.
        </div>
        {children}
      </body>
    </html>
  );
}
