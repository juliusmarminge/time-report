"use client";

import { Fragment, useEffect, useState } from "react";
import { format } from "date-fns";
import { dinero, toDecimal } from "dinero.js";

import type { Period } from "~/db/getters";
import { currencies, formatMoney } from "~/lib/currencies";
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

function PeriodCard(props: { period: Period }) {
  const { period } = props;

  const nSlots = period.timeslot.length;
  const nHours = period.timeslot.reduce((acc, slot) => +slot.duration + acc, 0);
  const revenue = dinero({
    // FIXME: This is wrong maths that doesn't account
    // for differnt currencies in the same period
    amount: period.timeslot.reduce(
      (acc, slot) => slot.chargeRate * +slot.duration + acc,
      0,
    ),
    currency: currencies[period.timeslot[0].currency ?? "USD"],
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">{period.client.name}</h2>
        <p className="text-sm text-muted-foreground">
          {format(period.startDate, "MMM do")} to{" "}
          {format(period.endDate, "MMM do")}
        </p>
        {period.endDate < new Date() && (
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
                {format(slot.date, "MMM do")}
                {` - `}
                {slot.duration}
                {`h @ `}
                {toDecimal(chargeRate, (money) => formatMoney(money))}
              </p>
            </div>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2">
        <Button
          onClick={async () => {
            await closePeriod(period.id, { openNewPeriod: false });
          }}
        >
          Close Period
        </Button>
      </div>
    </div>
  );
}

export function ClosePeriodSheet(props: { openPeriods: Period[] }) {
  const [expiredPeriodsDialogOpen, setExpiredPeriodsDialogOpen] =
    useState(false);

  useEffect(() => {
    const hasExpiredPeriods = props.openPeriods.some(
      (period) => period.endDate < new Date(),
    );
    setExpiredPeriodsDialogOpen(hasExpiredPeriods);
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
              {`You have ${props.openPeriods.length} open periods.`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            {props.openPeriods.map((period, idx) => (
              <Fragment key={period.id}>
                <PeriodCard period={period} />
                {idx < props.openPeriods.length - 1 && <Separator />}
              </Fragment>
            ))}
          </div>
        </div>
      </SheetContent>

      <AlertDialog
        open={expiredPeriodsDialogOpen}
        onOpenChange={setExpiredPeriodsDialogOpen}
      >
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
