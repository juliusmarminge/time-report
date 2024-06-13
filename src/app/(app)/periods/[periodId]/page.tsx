import { Suspense } from "react";
import { DashboardShell } from "../../_components/shell";
import { formatOrdinal, isPast } from "~/lib/temporal";
import { Badge } from "~/ui/badge";
import { dinero, toDecimal } from "dinero.js";
import {
  currencies,
  formatMoney,
  slotsToDineros,
  sumDineros,
} from "~/monetary/math";
import { createConverter } from "~/monetary/rsc";
import { currentUser } from "~/auth";
import { trpc } from "~/trpc/server";
import { notFound } from "next/navigation";

export default function PeriodsDetailsPage(
  props: Readonly<{
    params: { periodId: string };
  }>,
) {
  return (
    <DashboardShell
      title="Period"
      description="This page is under construction"
    >
      <Suspense>
        <PeriodsInformation id={props.params.periodId} />
      </Suspense>
    </DashboardShell>
  );
}

async function PeriodsInformation(
  props: Readonly<{
    id: string;
  }>,
) {
  const period = await trpc.getPeriod({ id: props.id });
  if (!period) notFound();

  const nSlots = period.timeslots.length;
  const nHours = period.timeslots.reduce(
    (acc, slot) => +slot.duration + acc,
    0,
  );

  const converter = await createConverter();
  const user = await currentUser();
  const revenue = sumDineros({
    dineros: slotsToDineros(period.timeslots),
    currency: user!.defaultCurrency,
    converter: converter.convert,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="font-bold text-lg">{period.client.name}</h2>
        <p className="text-muted-foreground text-sm">
          {formatOrdinal(period.startDate)}
          {" to "}
          {formatOrdinal(period.endDate)}
        </p>
        {isPast(period.endDate) && (
          <Badge variant="destructive" className="ml-auto">
            Expired
          </Badge>
        )}
      </div>
      <p className="text-sm">
        {nSlots} reported times ({nHours}h) for a total of{" "}
        <b>{toDecimal(revenue, formatMoney)}</b>
      </p>
      <ul>
        {period.timeslots.map((slot) => {
          const chargeRate = dinero({
            amount: slot.chargeRate,
            currency: currencies[slot.currency],
          });

          return (
            <div key={slot.id}>
              <p className="text-muted-foreground text-sm">
                {formatOrdinal(slot.date)}
                {" - "}
                {slot.duration}
                {"h @ "}
                {toDecimal(chargeRate, (money) => formatMoney(money))}
              </p>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
