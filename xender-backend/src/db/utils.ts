import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./schema";

export const UUID = {
  id: uuid().primaryKey().defaultRandom(),
};

export const TIMESTAMP = {
  createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

export const USER_ID_REFERENCE = {
  userId: uuid()
    .notNull()
    .references(() => userTable.id),
};
