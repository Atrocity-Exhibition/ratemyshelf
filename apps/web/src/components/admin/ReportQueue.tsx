"use client";

import { trpc } from "@/trpc/client";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string | Date;
  reporter: { username: string };
};

export function ReportQueue({
  initialData,
}: {
  initialData: { items: Report[]; total: number; page: number; totalPages: number };
}) {
  const utils = trpc.useUtils();
  const { data } = trpc.moderation.reportQueue.useQuery(
    { page: 1, limit: 20 },
    { initialData: initialData as never },
  );

  const resolve = trpc.moderation.resolveReport.useMutation({
    onSuccess: () => {
      void utils.moderation.reportQueue.invalidate();
      void utils.moderation.flaggedReviews.invalidate();
    },
  });

  if (!data || data.items.length === 0) {
    return <p className="text-sm text-slate-500">No pending reports.</p>;
  }

  return (
    <ul className="space-y-3">
      {data.items.map((report) => (
        <li key={report.id} className="space-y-2 rounded border border-slate-800 p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
              {report.targetType}
            </span>
            <span className="font-mono text-xs text-slate-500">
              {report.targetId}
            </span>
            <span className="ml-auto text-xs text-slate-500">
              by {report.reporter.username}
            </span>
          </div>
          <p className="text-sm text-slate-300">{report.reason}</p>
          <div className="flex flex-wrap gap-2">
            {(["DISMISS", "HIDE_REVIEW", "BAN_USER", "HIDE_NOVEL"] as const).map(
              (action) => (
                <button
                  key={action}
                  type="button"
                  disabled={resolve.isPending}
                  onClick={() => {
                    if (
                      action === "BAN_USER" &&
                      !window.confirm("Ban this user? This is not reversible in the UI.")
                    ) {
                      return;
                    }
                    resolve.mutate({ reportId: report.id, action });
                  }}
                  className="rounded border border-slate-700 px-2 py-1 text-xs hover:border-slate-500"
                >
                  {action}
                </button>
              ),
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
