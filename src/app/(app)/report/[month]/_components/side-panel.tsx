"use client";

import { Suspense } from "react";
import type { Temporal } from "@js-temporal/polyfill";
import { toDecimal } from "dinero.js";

import { NewClientSheet } from "~/app/(app)/clients/_components/new-client-form";
import type { Client, Timeslot } from "~/db/queries";
import { useConverter } from "~/lib/converter";
import { formatMoney } from "~/lib/currencies";
import { slotsToDineros, sumDineros } from "~/lib/monetary";
import { formatOrdinal } from "~/lib/temporal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { ReportTimeSheet } from "./report-time-form";
import { TimeslotCard } from "./timeslot-card";

export function SidePanel(props: {
  date: Temporal.PlainDate;
  clients: Client[];
  timeslots: Timeslot[];
  className?: string;
}) {
  const converter = useConverter();

  const totalRevenue = sumDineros({
    dineros: slotsToDineros(props.timeslots),
    currency: converter.preferredCurrency,
    converter: converter.convert,
  });

  const totalHours = props.timeslots.reduce(
    (acc, slot) => acc + +slot.duration,
    0,
  );

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle className="text-xl">
          {formatOrdinal(props.date, {
            weekday: "long",
            month: "long",
          })}
        </CardTitle>
        <CardDescription>
          {totalHours} hours billed for a total of{" "}
          {toDecimal(totalRevenue, formatMoney)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {props.timeslots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No timeslots for this date.
          </p>
        )}
        {props.timeslots.map((slot) => (
          <TimeslotCard key={slot.id} slot={slot} />
        ))}
        <Suspense>
          {props.clients.length === 0 ? (
            <NewClientSheet trigger="full" />
          ) : (
            <ReportTimeSheet date={props.date} clients={props.clients} />
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
}
