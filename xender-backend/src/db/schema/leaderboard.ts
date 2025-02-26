import { pgTable, integer, uuid, primaryKey } from "drizzle-orm/pg-core";
import { userTable } from ".";

export const leaderboard = pgTable(
  "leaderboard",
  {
    userId: uuid("user_id").references(() => userTable.id),
    score: integer("score").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId] }),
    };
  },
);
