import { Suspense } from "react";
import { format } from "date-fns";
import { toDecimal } from "dinero.js";

import type { Client, Timeslot } from "~/db/getters";
import type { CurrencyCode } from "~/lib/currencies";
import { formatMoney } from "~/lib/currencies";
import { getMonthMetadata } from "~/lib/get-month-metadata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { ReportTimeSheet } from "./report-time-form";
import { TimeslotCard } from "./timeslot-card";

export async function SidePanel(props: {
  date?: Date;
  clients: Client[];
  timeslots: Timeslot[];
  currency: CurrencyCode;
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

  const { totalRevenue, totalHours } = await getMonthMetadata(
    props.timeslots,
    props.currency,
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
          <ReportTimeSheet clients={props.clients} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
