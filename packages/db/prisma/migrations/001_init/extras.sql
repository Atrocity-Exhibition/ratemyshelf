-- Run after `prisma migrate deploy`; Prisma cannot express trigram indexes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS novel_alias_trgm
  ON "NovelAlias" USING GIN (alias gin_trgm_ops);

CREATE INDEX IF NOT EXISTS novel_title_trgm
  ON "Novel" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS novel_original_title_trgm
  ON "Novel" USING GIN ("originalTitle" gin_trgm_ops);
