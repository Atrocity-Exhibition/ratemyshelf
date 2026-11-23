export type DiscoveryGenre = {
  name: string;
  slug: string;
  description: string;
};

export type DiscoveryTag = {
  name: string;
  slug: string;
};

export function sortDiscoveryItems<T extends { name: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function genreHref(slug: string): string {
  return `/novels?genres=${encodeURIComponent(slug)}`;
}

export function tagHref(slug: string): string {
  return `/novels?tags=${encodeURIComponent(slug)}`;
}
