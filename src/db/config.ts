import { fileURLToPath } from "url";
import type { Config } from "drizzle-kit";

export const credentials = {
  host: "aws.connect.psdb.cloud",
  port: 3306,
  database: "personal",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

// Need to construct this ourselves since Drizzle doesn't add the SSL otherwise
const uri = [
  `mysql://${credentials.user}:${credentials.password}`,
  `@${credentials.host}:${credentials.port}`,
  `/${credentials.database}`,
  '?ssl={"rejectUnauthorized":true}',
].join("");

export default {
  dbCredentials: { uri },
  driver: "mysql2",
  schema: fileURLToPath(new URL("./schema.ts", import.meta.url)),
  tablesFilter: ["timeit_*"],
} satisfies Config;
