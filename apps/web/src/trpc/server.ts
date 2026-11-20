import { appRouter } from "@/server/root";
import { createContext } from "@/server/context";

export async function getApi() {
  return appRouter.createCaller(await createContext());
}
