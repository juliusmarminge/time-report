import type { Temporal } from "@js-temporal/polyfill";
import { createHttpClient } from "edgedb";
import e from "@edgedb-gen/edgeql-js";

export const edgedb = createHttpClient({
  tlsSecurity: process.env.EDGEDB_SECRET_KEY ? "default" : "insecure",
});

export const plainDate = (date: Temporal.PlainDate) =>
  e.cal.local_date(date.toString());

export { e };
export * from "@edgedb-gen/interfaces";
