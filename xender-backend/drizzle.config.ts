import { defineConfig } from "drizzle-kit";
import env from "./src/env";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
    ssl: false,
  },
  casing: "snake_case",
});
