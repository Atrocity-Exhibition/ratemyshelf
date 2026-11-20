import { registerJobs } from "./index";

async function main() {
  await registerJobs();
  console.log("RateMyShelf (RMS) job worker is running");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
