import { ReadStatus } from "@prisma/client";

export function lastChapterForStatus(
  status: ReadStatus,
  chapterCount: number,
): number | undefined {
  return status === ReadStatus.COMPLETED ? chapterCount : undefined;
}
