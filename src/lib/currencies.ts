import { cache } from "react";
import * as currencies from "@dinero.js/currencies";
import type { Dinero, Rates } from "dinero.js";
import { convert } from "dinero.js";

export { currencies };

export function formatMoney(opts: {
  value: string;
  currency: { code: string };
}) {
  return Number(opts.value).toLocaleString("en-US", {
    style: "currency",
    currency: opts.currency.code,
  });
}

export type CurrencyCode = keyof typeof currencies;
export type Currency = (typeof currencies)[keyof typeof currencies];

export const createConverter = cache(async () => {
  const ratesWithEurAsBase = (
    (await (
      await fetch(
        `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`,
      )
    ).json()) as { base: string; rates: Record<string, number> }
  ).rates;

  return (dineroObject: Dinero<number>, newCurrency: CurrencyCode) => {
    // Flip the rate so that the base is in the desired base currency
    const baseCurrency = dineroObject.toJSON().currency.code;
    const rates: Rates<number> = {
      [newCurrency]: {
        amount: Math.round(
          (ratesWithEurAsBase[baseCurrency] / ratesWithEurAsBase[newCurrency]) *
            1000,
        ),
        scale: 3,
      },
    };

    console.log("rates", rates);

    return convert(dineroObject, currencies[newCurrency], rates);
  };
});
