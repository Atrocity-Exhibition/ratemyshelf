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
  const [user, shelf, lists] = await Promise.all([
    api.auth.me(),
    api.shelves.myShelf(),
    api.lists.myLists(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My dashboard</h1>
        <p className="text-sm text-slate-400">
          Manage your reading shelves, custom lists, and profile.
        </p>
      </div>

      <ShelfTabs items={shelf as never} />
      <MyLists initialLists={lists as never} />
    </div>
  );
}
