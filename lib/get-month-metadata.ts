import "server-only";

import { cache } from "react";

import type { Timeslot } from "~/db/queries";
import { slotsToDineros, sumDineros } from "./monetary";
import type { CurrencyCode } from "./monetary";
import { createConverter } from "./monetary.server";

export const getMonthMetadata = cache(
  async (slots: Timeslot[], currency: CurrencyCode) => {
    const billedClients = new Set(slots.map((slot) => slot.clientId)).size;

    const totalHours = slots.reduce((acc, slot) => {
      return acc + Number(slot.duration);
    }, 0);

    const converter = await createConverter();
    const totalRevenue = sumDineros({
      dineros: slotsToDineros(slots),
      converter: converter.convert,
      currency,
    });

    return {
      billedClients,
      totalHours,
      totalRevenue,
    };
  },
);
