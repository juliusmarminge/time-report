import { parse } from "date-fns";
import {
  coerce,
  date,
  length,
  minLength,
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

export const updateTimeslotSchema = object({
  id: number(),
  duration: transform(string(), Number),
  currency: string(),
  chargeRate: transform(string(), Number),
});

export const createClientSchema = object({
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: coerce(number(), Number),
  currency: string([length(3, "Currency must be 3 characters.")]),
  image: optional(string("Required")),
});

export const updateClientSchema = object({
  clientId: number(),
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: transform(string(), Number),
  currency: string([length(3, "Currency must be 3 characters.")]),
});
