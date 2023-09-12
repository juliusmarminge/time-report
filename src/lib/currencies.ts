import { cache } from "react";
import * as dineroCurrencies from "@dinero.js/currencies";
import type { Dinero, Rates } from "dinero.js";
import { convert } from "dinero.js";

import type { FixerResponse } from "~/app/api/currencies/route";
import { BASE_URL } from "./constants";

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
  const heads = new Map((await import("next/headers")).headers());
  heads.delete("content-length");
  const ratesWithEurAsBase = await fetch(new URL("/api/currencies", BASE_URL), {
    headers: Object.fromEntries(heads),
  }).then((r) => r.json() as Promise<FixerResponse["rates"]>);

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
