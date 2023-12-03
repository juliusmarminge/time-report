import { Client } from "@planetscale/database";
import type { Logger } from "drizzle-orm";
import { drizzle as pscaleDrizzle } from "drizzle-orm/planetscale-serverless";

import * as schema from "./schema";

class _MyLogger implements Logger {
  constructor(private enabled: boolean = false) {}

  logQuery(query: string, params: unknown[]): void {
    this.enabled && console.log("[DRIZZLE]", { query, params });
  }
}

export const db = pscaleDrizzle(
  new Client({
    host: "aws.connect.psdb.cloud",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  }).connection(),
  {
    schema,
    logger: new _MyLogger(false),
  },
);
