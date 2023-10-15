import { parse } from "date-fns";
import {
  coerce,
  date,
  number,
  object,
  optional,
  string,
  transform,
  union,
} from "valibot";

export const reportTimeSchema = object({
  clientId: union([number(), coerce(number(), Number)]),
  date: union([
    date(),
    transform(string(), (value) => parse(value, "yyyy-MM-dd", new Date())),
  ]),
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
