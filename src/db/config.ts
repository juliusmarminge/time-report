import type { Config } from "drizzle-kit";

export const credentials = {
  host: "aws.connect.psdb.cloud",
  port: 3306,
  database: "personal",
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

// Need to construct this ourselves since Drizzle doesn't add the SSL otherwise
const uri = [
  `mysql://${credentials.username}:${credentials.password}`,
  `@${credentials.host}:${credentials.port}`,
  `/${credentials.database}`,
  '?ssl={"rejectUnauthorized":true}',
].join("");

export default {
  dbCredentials: { uri },
  driver: "mysql2",
  schema: "./src/db/schema.ts",
  tablesFilter: ["timeit_*"],
} satisfies Config;
