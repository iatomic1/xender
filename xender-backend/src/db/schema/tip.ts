import { numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { TIMESTAMP, UUID } from "../utils";
import { userTable } from ".";
import { createInsertSchema } from "drizzle-zod";

export const tip = pgTable("tip", {
  ...UUID,
  ...TIMESTAMP,
  fromUserId: uuid()
    .notNull()
    .references(() => userTable.id),
  toUserId: uuid()
    .notNull()
    .references(() => userTable.id),
  amount: numeric("amount").notNull(),
  currency: text().notNull(),
});
export const tipInsertSchema = createInsertSchema(tip);
