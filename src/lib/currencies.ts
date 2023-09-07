import { cache } from "react";
import * as dineroCurrencies from "@dinero.js/currencies";
import type { Dinero, Rates } from "dinero.js";
import { convert } from "dinero.js";

// @ts-expect-error - Module Augmentation doesn't seem to work.. Want the base as number, not number | number[]
export const currencies: Record<CurrencyCode, Currency> = dineroCurrencies;

export function formatMoney(opts: {
  value: string;
  currency: { code: string };
}) {
  return Number(opts.value).toLocaleString("en-US", {
    style: "currency",
    currency: opts.currency.code,
  });
}

export type CurrencyCode = keyof typeof dineroCurrencies;
export interface Currency {
  readonly code: CurrencyCode;
  readonly base: number;
  readonly exponent: number;
}

export const createConverter = cache(async () => {
  const ratesWithEurAsBase = (
    (await (
      await fetch(
        `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`,
      )
    ).json()) as { base: string; rates: Record<string, number> }
  ).rates;
  await Promise.resolve();

  return (dineroObject: Dinero<number>, newCurrency: CurrencyCode) => {
    // Flip the rate so that the base is in the desired base currency
    const baseCurrency = dineroObject.toJSON().currency.code as CurrencyCode;
    const rates = {
      [newCurrency]: {
        amount: Math.round(
          (ratesWithEurAsBase[newCurrency] / ratesWithEurAsBase[baseCurrency]) *
            1e6,
        ),
        scale: 6,
      },
    } satisfies Rates<number>;

    return convert(dineroObject, currencies[newCurrency], rates);
  };
});
