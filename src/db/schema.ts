import type { AdapterAccount } from "@auth/core/adapters";
import { Temporal } from "@js-temporal/polyfill";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  customType,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import type { CurrencyCode } from "~/lib/currencies";

const idColumn = bigint("id", { mode: "number", unsigned: true })
  .primaryKey()
  .autoincrement();

const temporalDateColumn = customType<{
  data: Temporal.PlainDate;
  driverData: string;
}>({
  dataType: () => "date",
  fromDriver: (value) => Temporal.PlainDate.from(value),
  toDriver: (value) => value.toString(),
});

const temporalInstantColumn = customType<{
  data: Temporal.Instant;
  driverData: string;
  config: { fsp?: number };
}>({
  dataType: (config) => `timestamp(${config?.fsp ?? 3})`,
  fromDriver: (value) =>
    Temporal.Instant.fromEpochMilliseconds(new Date(value).getTime()),
  toDriver: (value) => value.toString(),
});

export const client = mysqlTable(
  "client",
  {
    id: idColumn,
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    defaultCharge: int("default_charge").notNull(),
    defaultBillingPeriod: mysqlEnum("default_billing_period", [
      "weekly",
      "biweekly",
      "monthly",
    ])
      .notNull()
      .default("monthly"),
    currency: varchar("currency", { length: 3 })
      .$type<CurrencyCode>()
      .notNull(),
    createdAt: temporalInstantColumn("created_at")
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: temporalInstantColumn("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (client) => ({
    tenantIdIdx: index("tenantId_idx").on(client.tenantId),
  }),
);

export const clientRelations = relations(client, ({ many }) => ({
  timeslots: many(timeslot),
  periods: many(period),
}));

export const timeslot = mysqlTable(
  "timeslot",
  {
    id: idColumn,
    clientId: bigint("client_id", { mode: "number" }).notNull(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    date: temporalDateColumn("date").notNull(),
    duration: decimal("duration", { scale: 2, precision: 5 }).notNull(),
    description: text("description"),
    chargeRate: int("charge_rate").notNull(),
    currency: varchar("currency", { length: 3 })
      .$type<CurrencyCode>()
      .notNull(),
    createdAt: temporalInstantColumn("created_at").default(
      sql`CURRENT_TIMESTAMP(3)`,
    ),
    periodId: int("period_id"),
  },
  (timeslot) => ({
    date: index("date_idx").on(timeslot.date),
    clientIdIdx: index("clientId_idx").on(timeslot.clientId),
    tenantIdIdx: index("tenantId_idx").on(timeslot.tenantId),
    periodIdIdx: index("periodId_idx").on(timeslot.periodId),
  }),
);

export const timeslotRelations = relations(timeslot, ({ one }) => ({
  client: one(client, { fields: [timeslot.clientId], references: [client.id] }),
  period: one(period, { fields: [timeslot.periodId], references: [period.id] }),
}));

export const period = mysqlTable("period", {
  id: idColumn,
  clientId: bigint("client_id", { mode: "number" }).notNull(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  startDate: temporalDateColumn("start_date").notNull(),
  endDate: temporalDateColumn("end_date").notNull(),
  closedAt: temporalInstantColumn("closed_at"),
  status: mysqlEnum("status", ["open", "closed"]).notNull().default("open"),
  createdAt: temporalInstantColumn("created_at").default(
    sql`CURRENT_TIMESTAMP(3)`,
  ),
});

export const periodRelations = relations(period, ({ one, many }) => ({
  client: one(client, { fields: [period.clientId], references: [client.id] }),
  timeslot: many(timeslot),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: temporalInstantColumn("emailVerified", {
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
  defaultCurrency: varchar("currency", { length: 3 })
    .$type<CurrencyCode>()
    .default("USD")
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 255 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { fsp: 3 }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { fsp: 3 }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
