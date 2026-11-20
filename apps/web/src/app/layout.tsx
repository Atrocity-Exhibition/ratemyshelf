import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/trpc/react";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { CommandPalette } from "@/components/search/CommandPalette";

export const metadata: Metadata = {
  title: {
    default: "TrackWn — Webnovel ratings, reviews & shelves",
    template: "%s — TrackWn",
  },
  description:
    "Track webnovels, rate them across multiple dimensions, review them, and manage reading shelves.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
              <Link
                href="/"
                className="group flex items-center gap-0.5 text-lg font-bold tracking-tight text-slate-100 transition hover:text-white"
              >
                <span>Track</span>
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent group-hover:from-sky-300 group-hover:to-indigo-300">
                  Wn
                </span>
              </Link>
              <Link
                href="/novels"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Browse
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Search
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                My shelf
              </Link>
              <div className="ml-auto flex items-center gap-4">
                <AuthButtons />
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <CommandPalette />
          <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/40 py-8 text-center text-sm text-slate-500">
            TrackWn — metadata, ratings and reviews. We do not host chapters.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
