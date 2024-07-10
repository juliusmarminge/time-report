import { format } from "date-fns";
import * as z from "zod";
import { currencySchema } from "~/monetary/math";

const ensureDateIsString = z.union([
  z.date().transform((d) => format(d, "yyyy-MM-dd")),
  z.string(),
]);

const formDataFalse = z
  .literal(false)
  .or(z.enum(["false"]).transform(() => false as const));

const formDataTrue = z
  .literal(true)
  .or(z.enum(["true"]).transform(() => true as const));

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
    openNewPeriod: formDataFalse,
  }),
  z.object({
    id: z.string(),
    openNewPeriod: formDataTrue,
    clientId: z.string(),
    periodStart: ensureDateIsString,
    periodEnd: ensureDateIsString,
  }),
]);
