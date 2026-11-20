import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/trpc/react";
import { TopBarSearch } from "@/components/search/TopBarSearch";
import { ProfileDropdown } from "@/components/navigation/ProfileDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: {
    default: "RateMyShelf (RMS) — Webnovel ratings, reviews & shelves",
    template: "%s — RateMyShelf (RMS)",
  },
  description:
    "Track webnovels, rate them across multiple dimensions, review them, and manage reading shelves.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-[#f8f9fa] text-neutral-900 dark:bg-[#0f1013] dark:text-neutral-100">
        <Providers>
          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0f1013]/85">
            <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:gap-6">
              {/* Brand Logo */}
              <Link
                href="/"
                className="group flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight text-neutral-900 transition hover:opacity-90 dark:text-white"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-600 text-xs font-black text-white shadow-sm dark:bg-emerald-500 dark:text-neutral-950">
                  RMS
                </div>
                <span className="hidden font-extrabold sm:inline">
                  RateMy<span className="text-emerald-600 dark:text-emerald-400">Shelf</span>
                </span>
              </Link>

              {/* Integrated Fuzzy Search in Top Bar */}
              <div className="flex-1 max-w-md mx-auto">
                <TopBarSearch />
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <Link
                  href="/novels"
                  className="transition hover:text-neutral-900 dark:hover:text-white"
                >
                  Browse
                </Link>
                <Link
                  href="/novels?sort=score"
                  className="transition hover:text-neutral-900 dark:hover:text-white"
                >
                  Top Books
                </Link>
                <Link
                  href="/dashboard"
                  className="transition hover:text-neutral-900 dark:hover:text-white"
                >
                  My Shelf
                </Link>
              </div>

              {/* Right Action Items: Theme Toggle & Profile Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <ThemeToggle />
                <ProfileDropdown />
              </div>
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
            {children}
          </main>

          <footer className="mt-auto border-t border-neutral-200 bg-white py-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-[#0f1013] dark:text-neutral-500">
            <p>
              RateMyShelf (RMS) — metadata, ratings and reviews. We do not host
              chapters.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
