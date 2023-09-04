import { sql } from "drizzle-orm";
import {
  bigint,
  decimal,
  int,
  mysqlTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import type { CurrencyCode } from "~/lib/currencies";

const table = mysqlTableCreator((name) => `timeit_${name}`);

export const client = table("client", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  defaultCharge: int("default_charge").notNull(),
  currency: varchar("currency", { length: 3 }).$type<CurrencyCode>().notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`,
  ),
});

export const timeslot = table("timeslot", {
  id: serial("id").primaryKey(),
  clientId: bigint("client_id", { mode: "number" }).notNull(),
  date: timestamp("date", { fsp: 3 }).notNull(),
  duration: decimal("duration", { scale: 2, precision: 4 }).notNull(),
  description: text("description"),
  chargeRate: int("charge_rate").notNull(),
  currency: varchar("currency", { length: 3 }).$type<CurrencyCode>().notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).default(
    sql`CURRENT_TIMESTAMP(3)`,
  ),
});
