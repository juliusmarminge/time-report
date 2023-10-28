import { cache } from "react";
import { format } from "date-fns";

import type { Timeslot } from "~/db/getters";
import type { CurrencyCode } from "./currencies";
import { createConverter } from "./currencies";
import { slotsToDineros, sumDineros } from "./monetary";

// FIXME: Remove this function, use Temporal more
export const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

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
