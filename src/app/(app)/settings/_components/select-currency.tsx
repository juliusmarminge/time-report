"use client";
import { useState } from "react";
import { toast } from "sonner";

import { currencies, type CurrencyCode } from "~/monetary/math";
import { trpc } from "~/trpc/client";
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
  const [currency, setCurrency] = useState(props.currency);

  const { mutateAsync: setDefaultCurrency } =
    trpc.setDefaultCurrency.useMutation();

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
