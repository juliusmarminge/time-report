import { Client } from "@planetscale/database";
import type { Logger } from "drizzle-orm";
// import { drizzle as defaultDrizzle } from "drizzle-orm/mysql2";
// import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
// import { createPool } from "mysql2/promise";
import { drizzle as pscaleDrizzle } from "drizzle-orm/planetscale-serverless";

import * as schema from "./schema";

class _MyLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log("[DRIZZLE]", { query, params });
  }
}

export const db = pscaleDrizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  {
    schema,
    // logger: new _MyLogger(),
  },
);

// export const db = defaultDrizzle(
//   createPool({
//     host: "localhost",
//     user: "root",
//     port: 3306,
//     database: "time-report",
//   }),
//   {
//     schema,
//     mode: "default",
//     // logger: new _MyLogger(),
//   },
// ) as unknown as PlanetScaleDatabase<typeof schema>;
