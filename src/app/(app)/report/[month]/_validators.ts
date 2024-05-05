import { format } from "date-fns";
import * as z from "zod";
import { type CurrencyCode, currencies } from "~/monetary/math";

const ensureDateIsString = z.union([
  z.date().transform((d) => format(d, "yyyy-MM-dd")),
  z.string(),
]);
const currencySchema = z
  .string()
  .refine((s): s is CurrencyCode => s in currencies);

export const reportTimeSchema = z.object({
  clientId: z.string(),
  date: ensureDateIsString,
  duration: z.coerce.number(),
  description: z.string().optional(),
  chargeRate: z.coerce.number(),
  currency: currencySchema,
});

export const updateSchema = z.object({
  id: z.string(),
  duration: z.coerce.number(),
  currency: currencySchema,
  chargeRate: z.coerce.number(),
});

export const closePeriodSchema = z.union([
  z.object({
    id: z.string(),
    openNewPeriod: z.literal(false),
  }),
  z.object({
    id: z.string(),
    openNewPeriod: z.literal(true),
    clientId: z.string(),
    periodStart: ensureDateIsString,
    periodEnd: ensureDateIsString,
  }),
]);
