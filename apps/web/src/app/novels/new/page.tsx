import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { NovelForm } from "@/components/novel/NovelForm";

export const dynamic = "force-dynamic";

const RANK: Record<Role, number> = {
  ANONYMOUS: 0,
  USER: 1,
  CONTRIBUTOR: 2,
  MODERATOR: 3,
  ADMIN: 4,
};

export default async function NewNovelPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/novels/new");

  const role = (session.user.role ?? Role.USER) as Role;
  if (RANK[role] < RANK[Role.CONTRIBUTOR]) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold">Add a novel</h1>
        <p className="text-sm text-slate-400">
          Contributor access is required to add catalog entries. Ask a moderator to
          upgrade your role.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add a novel</h1>
        <p className="text-sm text-slate-400">
          Metadata only. Link out to official or licensed sources instead of
          hosting chapters.
        </p>
      </div>
      <NovelForm />
    </div>
  );
}
