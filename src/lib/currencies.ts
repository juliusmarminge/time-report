import { cache } from "react";
import * as dineroCurrencies from "@dinero.js/currencies";
import type { Dinero } from "dinero.js";

import { convert } from "./monetary";

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

export function normalizeAmount(
  amount: number,
  currency: CurrencyCode = "USD",
) {
  const currencyInfo = currencies[currency];
  return amount * currencyInfo.base ** currencyInfo.exponent;
}

export const getCurrencyRates = async () => {
  interface FixerResponse {
    base: string;
    timestamp: number;
    date: string;
    rates: Record<string, number>;
  }

  const res = (await (
    await fetch(
      `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`,
      { next: { revalidate: 60 * 60 * 24 } },
    )
  ).json()) as FixerResponse;
  return res.rates;
};

export const createConverter = cache(async () => {
  const ratesWithEurAsBase = await getCurrencyRates();

  const _convert = (
    dineroObject: Dinero<number>,
    newCurrency: CurrencyCode,
  ) => {
    return convert(dineroObject, newCurrency, ratesWithEurAsBase);
  };

  return { convert: _convert, rates: ratesWithEurAsBase };
});
