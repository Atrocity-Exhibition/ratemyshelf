import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getApi } from "@/trpc/server";
import { ListItemsEditor } from "@/components/lists/ListItemsEditor";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ListPage({ params }: { params: Params }) {
  const { id } = await params;
  const api = await getApi();

  let list: Awaited<ReturnType<typeof api.lists.byId>> | null = null;
  try {
    list = await api.lists.byId({ id });
  } catch {
    list = null;
  }

  if (!list) notFound();

  const session = await auth();
  const canEdit = session?.user.id === list.userId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{list.title}</h1>
        {list.description && <p className="text-slate-400">{list.description}</p>}
        <p className="text-sm text-slate-500">
          by {list.user.username} · {list.items.length} novels ·{" "}
          {list.isPublic ? "public" : "private"}
        </p>
      </div>

      {list.items.length === 0 ? (
        <p className="text-sm text-slate-500">This list is empty.</p>
      ) : canEdit ? (
        <ListItemsEditor listId={list.id} items={list.items} />
      ) : (
        <ol className="space-y-2">
          {list.items.map((item, index) => (
            <li
              key={item.novelId}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition hover:border-slate-700/80"
            >
              <span className="w-6 text-right text-sm text-slate-500">
                {index + 1}.
              </span>
              <Link href={`/novels/${item.novel.slug}`} className="font-medium text-slate-100 transition-colors hover:text-sky-300">
                {item.novel.title}
              </Link>
              <span className="ml-auto text-xs text-slate-500">
                {item.novel.chapterCount} ch.
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
