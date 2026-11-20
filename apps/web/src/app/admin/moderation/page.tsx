import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getApi } from "@/trpc/server";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { FlaggedReviews } from "@/components/admin/FlaggedReviews";
import { TagApprovalQueue } from "@/components/admin/TagApprovalQueue";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/moderation");

  const role = session.user.role;
  if (role !== Role.MODERATOR && role !== Role.ADMIN) {
    redirect("/");
  }

  const api = await getApi();
  const [reports, flagged] = await Promise.all([
    api.moderation.reportQueue({ page: 1, limit: 20 }),
    api.moderation.flaggedReviews({ page: 1, limit: 20 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Moderation</h1>
        <p className="text-sm text-slate-400">
          Report queue and automated abuse flags.
        </p>
        <Link href="/admin/novels" className="mt-2 inline-block text-sm">
          Manage novels →
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Pending reports ({reports.total})
        </h2>
        <ReportQueue initialData={reports as never} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Flagged reviews ({flagged.total})
        </h2>
        <FlaggedReviews initialData={flagged as never} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Proposed tags</h2>
        <TagApprovalQueue />
      </section>
    </div>
  );
}
