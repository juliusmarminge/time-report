import * as z from "zod";
import { currencySchema } from "~/monetary/math";

export const billingPeriods = ["weekly", "biweekly", "monthly"] as const;

export const createClientSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters."),
  defaultCharge: z.coerce.number(),
  defaultBillingPeriod: z.enum(billingPeriods),
  currency: currencySchema,
  image: z.string().optional(),
});

export const updateClientSchema = z.object({
  id: z.string(),
  name: z.string().min(4, "Name must be at least 4 characters."),
  defaultCharge: z.coerce.number(),
  defaultBillingPeriod: z.enum(billingPeriods),
  currency: currencySchema,
});
