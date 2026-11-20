"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { SessionProvider, useSession } from "next-auth/react";
import superjson from "superjson";
import { useEffect, useState } from "react";
import { trpc } from "./client";

function SessionRefresher() {
  const { status } = useSession();
  const refresh = trpc.auth.refresh.useMutation();

  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(
      () => {
        refresh.mutate();
      },
      12 * 60 * 1000,
    );
    return () => clearInterval(interval);
    // The mutation object is stable enough for a 12-minute interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return null;
}

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <SessionRefresher />
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
