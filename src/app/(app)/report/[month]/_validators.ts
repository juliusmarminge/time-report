import { format } from "date-fns";
import * as z from "zod";

const ensureDateIsString = z.union([
  z.date().transform((d) => format(d, "yyyy-MM-dd")),
  z.string(),
]);

export const reportTimeSchema = z.object({
  clientId: z.union([z.number(), z.coerce.number()]),
  date: ensureDateIsString,
  duration: z.coerce.number(),
  description: z.string().optional(),
  chargeRate: z.coerce.number(),
  currency: z.string(),
});

export const updateSchema = z.object({
  id: z.number(),
  duration: z.coerce.number(),
  currency: z.string(),
  chargeRate: z.coerce.number(),
});

export const closePeriodSchema = z.union([
  z.object({
    id: z.number(),
    openNewPeriod: z.literal(false),
  }),
  z.object({
    id: z.number(),
    openNewPeriod: z.literal(true),
    clientId: z.number(),
    periodStart: ensureDateIsString,
    periodEnd: ensureDateIsString,
  }),
]);
