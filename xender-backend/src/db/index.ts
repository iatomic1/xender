import { drizzle } from "drizzle-orm/postgres-js";
import env from "../env";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    ssl: false,
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : 1,
    onnotice: env.DB_SEEDING ? () => {} : undefined,
  },
  casing: "snake_case",
  logger: true,
  schema,
});
