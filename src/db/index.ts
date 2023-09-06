import { Client } from "@planetscale/database";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as schema from "./schema";

class MyLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log("[DRIZZLE]", { query, params });
  }
}

export const db = drizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  {
    schema,
    logger: new MyLogger(),
  },
);
