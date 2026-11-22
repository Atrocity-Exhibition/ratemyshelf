ALTER TABLE "Review"
  ALTER COLUMN "body" DROP NOT NULL,
  ALTER COLUMN "scoreStory" DROP NOT NULL,
  ALTER COLUMN "scoreCharacters" DROP NOT NULL,
  ALTER COLUMN "scoreWorldBuilding" DROP NOT NULL;

ALTER TABLE "NovelScoreCache"
  ALTER COLUMN "avgStory" DROP NOT NULL,
  ALTER COLUMN "avgCharacters" DROP NOT NULL,
  ALTER COLUMN "avgWorldBuilding" DROP NOT NULL;

UPDATE "Review"
SET "scoreOverall" = "scoreOverall" * 10;

UPDATE "NovelScoreCache"
SET
  "bayesianScore" = "bayesianScore" * 10,
  "avgOverall" = "avgOverall" * 10;
