import { Temporal } from "@js-temporal/polyfill";
import * as z from "zod";
import { getClients, getOpenPeriods, getTimeslots } from "~/db/queries";
import { protectedProcedure, t } from "./init";

export const appRouter = t.router({
  getClients: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ input }) => {
      return getClients(input.userId);
    }),
  getTimeslots: protectedProcedure
    .input(
      z.object({
        date: z.instanceof(Temporal.PlainDate),
        userId: z.string(),
        mode: z.enum(["exact", "month"]),
      }),
    )
    .query(({ input }) => {
      return getTimeslots(input.date, input.userId, { mode: input.mode });
    }),
  getOpenPeriods: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ input }) => {
      return getOpenPeriods(input.userId);
    }),
});

export type AppRouter = typeof appRouter;
