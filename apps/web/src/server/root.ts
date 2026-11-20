import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { novelsRouter } from "./routers/novels";
import { tagsRouter } from "./routers/tags";
import { searchRouter } from "./routers/search";
import { reviewsRouter } from "./routers/reviews";
import { shelvesRouter } from "./routers/shelves";
import { listsRouter } from "./routers/lists";
import { moderationRouter } from "./routers/moderation";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  auth: authRouter,
  novels: novelsRouter,
  tags: tagsRouter,
  search: searchRouter,
  reviews: reviewsRouter,
  shelves: shelvesRouter,
  lists: listsRouter,
  moderation: moderationRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
