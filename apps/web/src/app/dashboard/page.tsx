import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApi } from "@/trpc/server";
import { ShelfTabs } from "@/components/shelf/ShelfTabs";
import { MyLists } from "@/components/lists/MyLists";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const api = await getApi();
  const [shelf, lists] = await Promise.all([
    api.shelves.myShelf(),
    api.lists.myLists(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My dashboard</h1>
        <p className="text-sm text-slate-400">
          Signed in as {session.user.name ?? session.user.email}
        </p>
      </div>

      <ShelfTabs items={shelf as never} />
      <MyLists initialLists={lists as never} />
    </div>
  );
}
