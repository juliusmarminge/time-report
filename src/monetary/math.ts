import { add, convert as convertCore, dinero, multiply } from "dinero.js";
import type { Dinero, Rates } from "dinero.js";
import { z } from "zod";

export type CurrencyCode = import("~/edgedb").Currency;
export interface Currency {
  readonly code: CurrencyCode;
  readonly base: number;
  readonly exponent: number;
}

export const currencies: Record<CurrencyCode, Currency> = {
  EUR: { code: "EUR", base: 10, exponent: 2 },
  USD: { code: "USD", base: 10, exponent: 2 },
  GBP: { code: "GBP", base: 10, exponent: 2 },
  SEK: { code: "SEK", base: 10, exponent: 2 },
};

export const currencySchema = z
  .string()
  .refine((s): s is CurrencyCode => s in currencies);

export function formatMoney(opts: {
  value: string;
  currency: { code: string };
}) {
  return Number(opts.value).toLocaleString("en-US", {
    style: "currency",
    currency: opts.currency.code,
  });
}

export function formatDiff(diff: number | string) {
  const isNegative = String(diff).startsWith("-");
  return isNegative ? `${diff}` : `+${diff}`;
}

export function normalizeAmount(
  amount: number,
  currency: CurrencyCode = "USD",
) {
  const currencyInfo = currencies[currency];
  return amount * currencyInfo.base ** currencyInfo.exponent;
}

export const convert = (
  dineroObject: Dinero<number>,
  newCurrency: CurrencyCode,
  rates: Record<string, number>,
) => {
  // Flip the rate so that the base is in the desired base currency
  const baseCurrency = dineroObject.toJSON().currency.code as CurrencyCode;
  const properRates = {
    [newCurrency]: {
      amount: Math.round((rates[newCurrency] / rates[baseCurrency]) * 1e6),
      scale: 6,
    },
  } satisfies Rates<number>;

  return convertCore(dineroObject, currencies[newCurrency], properRates);
};

// Hoisted type without rates
type HoistedConverter = (
  arg1: Parameters<typeof convert>[0],
  arg2: Parameters<typeof convert>[1],
) => Dinero<number>;

export function sumDineros(opts: {
  dineros: Dinero<number>[];
  converter: HoistedConverter;
  currency: CurrencyCode;
}) {
  const totalRevenue = opts.dineros.reduce(
    (acc, dineroObject) => {
      return add(acc, opts.converter(dineroObject, opts.currency));
    },
    dinero({ amount: 0, currency: currencies[opts.currency] }),
  );

  return totalRevenue;
}

export function slotsToDineros(
  slots: { chargeRate: number; currency: CurrencyCode; duration: string }[],
) {
  return slots.map((s) =>
    multiply(
      dinero({ amount: s.chargeRate, currency: currencies[s.currency] }),
      +s.duration,
    ),
  );
}
