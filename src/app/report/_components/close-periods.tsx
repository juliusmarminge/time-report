"use client";

import { Fragment, useEffect, useState } from "react";
import { addDays, addWeeks, endOfMonth, endOfWeek, format } from "date-fns";
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
    currency: currencies[period.timeslot[0]?.currency ?? "USD"],
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
      <ClosePeriodConfirmationModal period={period} />
    </div>
  );
}

export function ClosePeriodConfirmationModal(props: { period: Period }) {
  const [newPeriodDialogOpen, setNewPeriodDialogOpen] = useState(false);
  const [newPeriodStart, setNewPeriodStart] = useState<Date>(
    addDays(props.period.endDate, 1),
  );
  const billingPeriod = props.period.client.defaultBillingPeriod;
  const [newPeriodEnd, setNewPeriodEnd] = useState<Date>(
    billingPeriod === "monthly"
      ? endOfMonth(newPeriodStart)
      : billingPeriod === "biweekly"
      ? endOfWeek(addWeeks(newPeriodStart, 1))
      : endOfWeek(newPeriodStart),
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
                periodStart: newPeriodStart,
                periodEnd: newPeriodEnd,
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
