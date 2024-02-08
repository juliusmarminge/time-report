import "server-only";

import type { Dinero } from "dinero.js";
import { cache } from "react";

import type { CurrencyCode } from "./math";
import { convert } from "./math";

export const getCurrencyRates = async () => {
  interface FixerResponse {
    timestamp: number;
    date: string;
    base_code: string;
    conversion_rates: Record<string, number>;
  }

  const res = (await (
    await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/EUR`,
      // `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`,
      { next: { revalidate: 60 * 60 * 24 } },
    )
  ).json()) as FixerResponse;
  return res.conversion_rates;
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
