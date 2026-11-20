import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="text-slate-400">That page or novel does not exist.</p>
      <Link href="/novels" className="inline-block">
        Browse the catalog
      </Link>
    </div>
  );
}
