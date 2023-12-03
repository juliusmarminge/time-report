import { fileURLToPath } from "url";
import type { Config } from "drizzle-kit";

const uri = [
  "mysql://",
  process.env.DB_USERNAME,
  ":",
  process.env.DB_PASSWORD,
  "@aws.connect.psdb.cloud:3306/",
  process.env.DB_NAME,
  '?ssl={"rejectUnauthorized":true}',
].join("");

export default {
  dbCredentials: { uri },
  driver: "mysql2",
  schema: fileURLToPath(new URL("./schema.ts", import.meta.url)),
  tablesFilter: ["timeit_*"],
} satisfies Config;
