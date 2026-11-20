import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getApi } from "@/trpc/server";
import { AdminNovelTable } from "@/components/admin/AdminNovelTable";

export const dynamic = "force-dynamic";

export default async function AdminNovelsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/novels");

  const role = session.user.role;
  if (role !== Role.MODERATOR && role !== Role.ADMIN) {
    redirect("/");
  }

  const api = await getApi();
  const novels = await api.novels.adminList({ page: 1, limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Manage novels</h1>
          <p className="text-sm text-slate-400">
            Hide entries without deleting their reviews. Hidden novels drop out of
            the catalog and search index.
          </p>
        </div>
        <Link href="/admin/moderation" className="text-sm">
          Moderation queue →
        </Link>
      </div>

      <AdminNovelTable initialData={novels as never} />
    </div>
  );
}
