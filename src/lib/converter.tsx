"use client";

import * as React from "react";
import { Dinero } from "dinero.js";
import { useSession } from "next-auth/react";

import type { CurrencyCode } from "./currencies";
import { convert } from "./monetary";

/**
 * Context that allows the server to pass the exchange rates once, and then
 * the client can use them to convert Dinero objects everywhere. Avoids passing
 * the rates to a bunch of client compoenents all over the place...
 */

const ConvertedContext = React.createContext<{
  preferredCurrency: CurrencyCode;
  convert: (dinero: Dinero<number>, currency: CurrencyCode) => Dinero<number>;
} | null>(null);

export const useConverter = () => {
  const context = React.useContext(ConvertedContext);
  if (!context) {
    throw new Error("useConverter must be used within a ConverterProvider");
  }
  return context;
};

export const ConverterProvider = (props: {
  children: React.ReactNode;
  rates: Record<string, number>;
}) => {
  const { data } = useSession();

  const _convert = React.useCallback(
    (d: Dinero<number>, c: CurrencyCode) => convert(d, c, props.rates),
    [props.rates],
  );

  return (
    <ConvertedContext.Provider
      value={{
        convert: _convert,
        preferredCurrency: data?.user.defaultCurrency ?? "USD",
      }}
    >
      {props.children}
    </ConvertedContext.Provider>
  );
};
