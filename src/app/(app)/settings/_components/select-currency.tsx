"use client";
import * as React from "react";
import { toast } from "sonner";

import { setDefaultCurrency } from "~/auth/actions";
import { currencies, type CurrencyCode } from "~/monetary/math";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/ui/select";

export function SelectCurrency(props: {
  currency: CurrencyCode;
}) {
  const [currency, setCurrency] = React.useState(props.currency);

  return (
    <Select
      name="currency"
      value={currency}
      onValueChange={(value) => {
        setCurrency(value as CurrencyCode);
        toast.promise(setDefaultCurrency(value as CurrencyCode), {
          loading: "Updating currency...",
          success: "Currency updated",
          error: "Failed to update currency",
        });
      }}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(currencies).map(([code, curr]) => (
          <SelectItem key={code} value={code}>
            {curr.symbol} {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
