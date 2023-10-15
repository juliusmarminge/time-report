import { cache } from "react";
import { add, dinero, multiply } from "dinero.js";

import type { Timeslot } from "~/db/getters";
import type { CurrencyCode } from "./currencies";
import { createConverter, currencies } from "./currencies";

export const getMonthMetadata = cache(
  async (slots: Timeslot[], currency: CurrencyCode) => {
    const billedClients = new Set(slots.map((slot) => slot.clientId)).size;

    const totalHours = slots.reduce((acc, slot) => {
      return acc + Number(slot.duration);
    }, 0);

    const convert = await createConverter();
    const totalRevenue = slots.reduce(
      (acc, slot) => {
        const dineroObject = dinero({
          amount: slot.chargeRate,
          currency: currencies[slot.currency],
        });

        return add(
          acc,
          multiply(convert(dineroObject, currency), parseFloat(slot.duration)),
        );
      },
      dinero({ amount: 0, currency: currencies[currency] }),
    );

    return {
      billedClients,
      totalHours,
      totalRevenue,
    };
  },
);
