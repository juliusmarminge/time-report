import { format } from "date-fns";
import {
  coerce,
  date,
  literal,
  number,
  object,
  optional,
  string,
  transform,
  union,
} from "valibot";

const ensureDateIsString = union([
  transform(date(), (d) => format(d, "yyyy-MM-dd")),
  string(),
]);

export const reportTimeSchema = object({
  clientId: union([number(), coerce(number(), Number)]),
  date: ensureDateIsString,
  duration: coerce(number(), Number),
  description: optional(string()),
  chargeRate: coerce(number(), Number),
  currency: string(),
});

export const updateSchema = object({
  duration: transform(string(), Number),
  currency: string(),
  chargeRate: transform(string(), Number),
});

export const closePeriodSchema = union([
  object({
    openNewPeriod: literal(false),
  }),
  object({
    openNewPeriod: literal(true),
    clientId: number(),
    periodStart: ensureDateIsString,
    periodEnd: ensureDateIsString,
  }),
]);
