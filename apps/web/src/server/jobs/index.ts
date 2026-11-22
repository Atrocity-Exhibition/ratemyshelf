import { registerScoreWorker } from "./recalculateScore";
import { registerSearchWorker } from "./syncSearchIndex";
import { registerAbuseWorker } from "./sweepAbuseScores";
import { registerTagVoteWorker } from "./resolveTagVotes";

export async function registerJobs(): Promise<void> {
  // pg-boss creates queues and schedules inside transactions that take
  // ShareRowExclusiveLock on shared tables. Registering in parallel deadlocks.
  await registerSearchWorker();
  await registerScoreWorker();
  await registerAbuseWorker();
  await registerTagVoteWorker();
}
