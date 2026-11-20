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
      <body>
        <Providers>
          <header className="border-b border-slate-800 bg-slate-900/60">
            <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
              <Link href="/" className="text-lg font-bold text-slate-100">
                Track<span className="text-sky-400">Wn</span>
              </Link>
              <Link href="/novels">Browse</Link>
              <Link href="/search">Search</Link>
              <Link href="/dashboard">My shelf</Link>
              <div className="ml-auto flex items-center gap-4">
                <AuthButtons />
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <CommandPalette />
          <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
            TrackWn — metadata, ratings and reviews. We do not host chapters.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
