import type { AdapterAccount } from "@auth/core/adapters";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  decimal,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import type { CurrencyCode } from "~/lib/currencies";

export const table = mysqlTableCreator((name) => `timeit_${name}`);

export const client = table(
  "client",
  {
    id: serial("id").primaryKey(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }).notNull(),
    defaultCharge: int("default_charge").notNull(),
    currency: varchar("currency", { length: 3 })
      .$type<CurrencyCode>()
      .notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).default(
      sql`CURRENT_TIMESTAMP(3)`,
    ),
  },
  (client) => ({
    tenantIdIdx: index("tenantId_idx").on(client.tenantId),
  }),
);

export const timeslot = table(
  "timeslot",
  {
    id: serial("id").primaryKey(),
    clientId: bigint("client_id", { mode: "number" }).notNull(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    date: timestamp("date", { fsp: 3 }).notNull(),
    duration: decimal("duration", { scale: 2, precision: 4 }).notNull(),
    description: text("description"),
    chargeRate: int("charge_rate").notNull(),
    currency: varchar("currency", { length: 3 })
      .$type<CurrencyCode>()
      .notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).default(
      sql`CURRENT_TIMESTAMP(3)`,
    ),
  },
  (timeslot) => ({
    date: index("date_idx").on(timeslot.date),
    clientIdIdx: index("clientId_idx").on(timeslot.clientId),
    tenantIdIdx: index("tenantId_idx").on(timeslot.tenantId),
  }),
);

export const users = table("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

// I don't need relational queries for now, and I don't quite understand how to
// make drizzle studio work with them, so I'm leaving this commented out for now.
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts, { relationName: "user" }),
}));

export const accounts = table(
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
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = table(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = table(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
