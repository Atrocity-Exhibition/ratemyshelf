import { parseSlugList } from "./catalogFilters";

type QueryValue = string | string[] | undefined;

export type CatalogQuery = {
  q?: string;
  status?: string;
  country?: string;
  sort?: string;
  genres?: string[];
  excludeGenres?: string[];
  tags?: string[];
  excludeTags?: string[];
  page?: number;
};

function first(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCatalogQuery(
  searchParams: Record<string, QueryValue>,
): CatalogQuery {
  const q = first(searchParams.q)?.trim();
  return {
    q: q || undefined,
    status: first(searchParams.status),
    country: first(searchParams.country),
    sort: first(searchParams.sort) ?? "latest",
    genres: parseSlugList(first(searchParams.genres)),
    excludeGenres: parseSlugList(first(searchParams.excludeGenres)),
    tags: parseSlugList(first(searchParams.tags)),
    excludeTags: parseSlugList(first(searchParams.excludeTags)),
    page: Math.max(1, Number(first(searchParams.page) ?? 1) || 1),
  };
}

export function buildCatalogQuery(
  query: CatalogQuery,
  options: { omitQuery?: boolean; omitPage?: boolean } = {},
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q && !options.omitQuery) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.country) params.set("country", query.country);
  if (query.sort && query.sort !== "latest") params.set("sort", query.sort);
  if (query.genres?.length) params.set("genres", query.genres.join(","));
  if (query.excludeGenres?.length) {
    params.set("excludeGenres", query.excludeGenres.join(","));
  }
  if (query.tags?.length) params.set("tags", query.tags.join(","));
  if (query.excludeTags?.length) {
    params.set("excludeTags", query.excludeTags.join(","));
  }
  if (!options.omitPage && query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  return params;
}
