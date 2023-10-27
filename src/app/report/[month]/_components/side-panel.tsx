import { Suspense } from "react";
import { format } from "date-fns";
import { toDecimal } from "dinero.js";

import { NewClientSheet } from "~/app/clients/_components/new-client-form";
import type { Client, Timeslot } from "~/db/getters";
import type { CurrencyCode } from "~/lib/currencies";
import { formatMoney } from "~/lib/currencies";
import { convert, slotsToDineros, sumDineros } from "~/lib/monetary";
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
  date?: Date;
  clients: Client[];
  timeslots: Timeslot[];
  currency: CurrencyCode;
  conversionRates: Record<CurrencyCode, number>;
}) {
  if (!props.date) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">No date selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a date to view timeslots.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = sumDineros({
    dineros: slotsToDineros(props.timeslots),
    converter: (d, c) => convert(d, c, props.conversionRates),
    currency: props.currency,
  });

  const totalHours = props.timeslots.reduce(
    (acc, slot) => acc + +slot.duration,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {format(props.date, "EEEE, MMMM do")}
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
