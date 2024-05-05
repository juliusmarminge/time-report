import { format } from "date-fns";
import * as z from "zod";

const ensureDateIsString = z.union([
  z.date().transform((d) => format(d, "yyyy-MM-dd")),
  z.string(),
]);

export const reportTimeSchema = z.object({
  clientId: z.string(),
  date: ensureDateIsString,
  duration: z.coerce.number(),
  description: z.string().optional(),
  chargeRate: z.coerce.number(),
  currency: z.string(),
});

export const updateSchema = z.object({
  id: z.string(),
  duration: z.coerce.number(),
  currency: z.string(),
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
