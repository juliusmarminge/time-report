import {
  coerce,
  length,
  minLength,
  number,
  object,
  optional,
  picklist,
  string,
  transform,
} from "valibot";

export const createClientSchema = object({
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: coerce(number(), Number),
  defaultBillingPeriod: picklist(["weekly", "biweekly", "monthly"]),
  currency: string([length(3, "Currency must be 3 characters.")]),
  image: optional(string("Required")),
});

export const updateClientSchema = object({
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: transform(string(), Number),
  defaultBillingPeriod: picklist(["weekly", "biweekly", "monthly"]),
  currency: string([length(3, "Currency must be 3 characters.")]),
});
