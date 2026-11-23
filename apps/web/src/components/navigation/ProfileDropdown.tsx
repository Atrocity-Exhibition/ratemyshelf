"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Bookmark,
  TrendingUp,
  Clock,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Tags,
} from "lucide-react";
import { trpc } from "@/trpc/client";

export function ProfileDropdown() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const user = session?.user;
  const { data: currentUser } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: async () => {
      await signOut({ redirect: false });
      window.location.href = "/";
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 transition hover:border-neutral-500 hover:ring-2 hover:ring-neutral-400/20 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-500"
        aria-label="User menu"
      >
        {(currentUser?.avatarUrl ?? user?.image) ? (
          <Image
            src={currentUser?.avatarUrl ?? user?.image ?? ""}
            alt={user?.name ?? "User"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : user?.name ? (
          <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        ) : (
          <User className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl dark:border-neutral-800 dark:bg-[#15161b]">
          {isAuthenticated && (
            <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {user?.name ?? "Account"}
              </p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {user?.email}
              </p>
            </div>
          )}

          <div className="py-1 text-xs">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <Link
                    href={`/users/${user.name}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    My Profile
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
                  My Shelf
                </Link>
              </>
            ) : null}

            <Link
              href="/genres-tags"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Tags className="h-3.5 w-3.5 text-[#0eb23a]" />
              Genres &amp; Tags
            </Link>

            <Link
              href="/novels?sort=score"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Top Books
            </Link>

            <Link
              href="/novels?sort=latest"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              Recently Added
            </Link>

            {user?.role === "ADMIN" || user?.role === "MODERATOR" ? (
              <Link
                href="/admin/moderation"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-amber-600 transition hover:bg-neutral-100 dark:text-amber-400 dark:hover:bg-neutral-800"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Moderation Queue
              </Link>
            ) : null}
          </div>

          <div className="border-t border-neutral-100 pt-1 text-xs dark:border-neutral-800">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logoutMutation.mutate();
                }}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-rose-600 transition hover:bg-neutral-100 dark:text-rose-400 dark:hover:bg-neutral-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                {logoutMutation.isPending ? "Signing out…" : "Log Out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <LogIn className="h-3.5 w-3.5 text-neutral-400" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 font-medium text-emerald-600 transition hover:bg-neutral-100 dark:text-emerald-400 dark:hover:bg-neutral-800"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
