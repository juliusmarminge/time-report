"use client";

import type { Dinero } from "dinero.js";
import type { Session } from "next-auth";
import { createContext, use, useMemo } from "react";

import { convert } from "./math";
import type { CurrencyCode } from "./math";

/**
 * Context that allows the server to pass the exchange rates once, and then
 * the client can use them to convert Dinero objects everywhere. Avoids passing
 * the rates to a bunch of client compoenents all over the place...
 */

export const ConverterContext = createContext<{
  preferredCurrency: CurrencyCode;
  convert: (dinero: Dinero<number>, currency: CurrencyCode) => Dinero<number>;
}>({
  preferredCurrency: "USD",
  convert: (d) => d,
});

export const ConverterProvider = (props: {
  children: React.ReactNode;
  rates: Promise<Record<string, number>>;
  user: Promise<Session["user"] | null>;
}) => {
  const rates = use(props.rates);
  const curr = use(props.user)?.defaultCurrency;

  const contextValue = useMemo(
    () => ({
      convert: (d: Dinero<number>, c: CurrencyCode) => convert(d, c, rates),
      preferredCurrency: curr ?? "USD",
    }),
    [rates, curr],
  );

  return (
    <ConverterContext.Provider value={contextValue}>
      {props.children}
    </ConverterContext.Provider>
  );
};
