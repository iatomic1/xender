import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { TIMESTAMP, UUID } from "../utils";

export const user = pgTable("user", {
  ...UUID,
  ...TIMESTAMP,
  xUsername: text().notNull().unique(),
  totalSent: numeric("total_sent").default("0"),
  totalReceived: numeric("total_received").default("0"),
  stxAddress: text().notNull(),
});
