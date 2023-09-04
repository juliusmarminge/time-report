import { fileURLToPath } from "url";
import type { Config } from "drizzle-kit";

export default {
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "",
  },
  driver: "mysql2",
  schema: fileURLToPath(new URL("./schema.ts", import.meta.url)),
  tablesFilter: ["timeit_*"],
} satisfies Config;
