import { Client } from "@planetscale/database";
import type { Logger } from "drizzle-orm";
import { drizzle as defaultDrizzle } from "drizzle-orm/mysql2";
import type { PlanetScaleDatabase} from "drizzle-orm/planetscale-serverless";
import { drizzle as pscaleDrizzle } from "drizzle-orm/planetscale-serverless";
import { createPool } from "mysql2/promise";

import * as schema from "./schema";

class _MyLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log("[DRIZZLE]", { query, params });
  }
}
function createDrizzle() {
  if (process.env.USE_OFFLINE) {
    const db = defaultDrizzle(
      createPool({
        uri: process.env.DATABASE_URL,
      }),
      {
        schema,
        mode: "default",
        // logger: new _MyLogger(),
      },
    );

    return db
  }

  return pscaleDrizzle(
    new Client({
      url: process.env.DATABASE_URL,
    }).connection(),
    {
      schema,
      // logger: new _MyLogger(),
    },
  );
}

export const db = createDrizzle() as PlanetScaleDatabase<typeof schema>;
