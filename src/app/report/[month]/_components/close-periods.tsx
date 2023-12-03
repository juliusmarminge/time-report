"use client";

import { Fragment, useEffect, useState } from "react";
import { dinero, toDecimal } from "dinero.js";
import type { TsonSerialized } from "tupleson";

import type { Period } from "~/db/getters";
import type { CurrencyCode } from "~/lib/currencies";
import { currencies, formatMoney } from "~/lib/currencies";
import { convert, slotsToDineros, sumDineros } from "~/lib/monetary";
import { formatOrdinal, isPast } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "~/ui/alert-dialog";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { DatePicker } from "~/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog";
import { Label } from "~/ui/label";
import { Separator } from "~/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/sheet";
import { closePeriod } from "../_actions";

function PeriodCard(props: {
  period: Period;
  // TODO: Maybe put into context to avoid prop drilling everywhere
  conversionRates: Record<string, number>;
  userCurrency: CurrencyCode;
}) {
  const { period } = props;

  const nSlots = period.timeslot.length;
  const nHours = period.timeslot.reduce((acc, slot) => +slot.duration + acc, 0);

  const revenue = sumDineros({
    dineros: slotsToDineros(period.timeslot),
    currency: props.userCurrency,
    converter: (d, c) => convert(d, c, props.conversionRates),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">{period.client.name}</h2>
        <p className="text-sm text-muted-foreground">
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
        {period.timeslot.map((slot) => {
          const chargeRate = dinero({
            amount: slot.chargeRate,
            currency: currencies[slot.currency],
          });

          return (
            <div key={slot.id}>
              <p className="text-sm text-muted-foreground">
                {formatOrdinal(slot.date)}
                {` - `}
                {slot.duration}
                {`h @ `}
                {toDecimal(chargeRate, (money) => formatMoney(money))}
              </p>
            </div>
          );
        })}
      </ul>
      <ClosePeriodConfirmationModal period={period} />
    </div>
  );
}

export function ClosePeriodConfirmationModal(props: { period: Period }) {
  const [newPeriodDialogOpen, setNewPeriodDialogOpen] = useState(false);
  const [newPeriodStart, setNewPeriodStart] = useState(
    props.period.endDate.add({ days: 1 }),
  );
  const billingPeriod = props.period.client.defaultBillingPeriod;
  const [newPeriodEnd, setNewPeriodEnd] = useState(
    billingPeriod === "monthly"
      ? newPeriodStart.with({ day: newPeriodStart.daysInMonth })
      : billingPeriod === "biweekly"
        ? newPeriodStart.add({ weeks: 2 })
        : newPeriodStart.add({ weeks: 1 }),
  );

  return (
    <Dialog open={newPeriodDialogOpen} onOpenChange={setNewPeriodDialogOpen}>
      <DialogTrigger asChild>
        <Button>Close Period</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Period</DialogTitle>
          <DialogDescription>
            Closing a period marks the end of this billing period. You can
            choose to open a new one for the upcoming billing period, or close
            this one without opening a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>New Period Start</Label>
            <DatePicker
              required
              date={newPeriodStart}
              setDate={setNewPeriodStart}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>New Period End</Label>
            <DatePicker
              required
              date={newPeriodEnd}
              setDate={setNewPeriodEnd}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={async () => {
              await closePeriod(props.period.id, { openNewPeriod: false });
              setNewPeriodDialogOpen(false);
            }}
          >
            Close Period
          </Button>
          <Button
            onClick={async () => {
              await closePeriod(props.period.id, {
                openNewPeriod: true,
                clientId: props.period.client.id,
                periodStart: newPeriodStart.toString(),
                periodEnd: newPeriodEnd.toString(),
              });
              setNewPeriodDialogOpen(false);
            }}
          >
            Close and Open New Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ClosePeriodSheet(props: {
  openPeriods: TsonSerialized<Period[]>;
  conversionRates: Record<string, number>;
  userCurrency: CurrencyCode;
}) {
  const openPeriods = tson.deserialize(props.openPeriods);

  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const hasExpiredPeriods = openPeriods.some((period) =>
      isPast(period.endDate),
    );
    setDialogOpen(hasExpiredPeriods);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Periods</Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Open Periods</SheetTitle>
            <SheetDescription>
              {`You have ${openPeriods.length} open periods.`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            {openPeriods.map((period, idx) => (
              <Fragment key={period.id}>
                <PeriodCard
                  period={period}
                  conversionRates={props.conversionRates}
                  userCurrency={props.userCurrency}
                />
                {idx < openPeriods.length - 1 && <Separator />}
              </Fragment>
            ))}
          </div>
        </div>
      </SheetContent>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>You have expired periods.</AlertDialogTitle>
          <AlertDialogDescription>
            It is recommended that you close expired periods.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Remind me later</AlertDialogCancel>
            <AlertDialogAction asChild>
              <SheetTrigger asChild>
                <Button variant="secondary">Manage</Button>
              </SheetTrigger>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
