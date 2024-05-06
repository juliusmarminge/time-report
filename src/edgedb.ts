import e from "@edgedb-gen/edgeql-js";
import type { Temporal } from "@js-temporal/polyfill";
import { createClient } from "edgedb";

export const db = createClient();

export const plainDate = (date: Temporal.PlainDate) =>
  e.cal.local_date(date.toString());

export { e };
export * from "@edgedb-gen/interfaces";
