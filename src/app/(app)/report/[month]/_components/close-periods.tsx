"use client";

import { dinero, toDecimal } from "dinero.js";
import { Fragment, use, useEffect, useState } from "react";
import type { TsonSerialized } from "tupleson";

import { formatOrdinal, isPast } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import { ConverterContext } from "~/monetary/context";
import {
  currencies,
  formatMoney,
  slotsToDineros,
  sumDineros,
} from "~/monetary/math";
import type { Period } from "~/trpc/datalayer";
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
import { Label } from "~/ui/label";
import { useResponsiveSheet } from "~/ui/responsive-sheet";
import { Separator } from "~/ui/separator";
import { closePeriod } from "../_actions";
import { useLocalStorage } from "~/lib/utility-hooks";

function PeriodCard(props: { period: Period }) {
  const { period } = props;

  const nSlots = period.timeslots.length;
  const nHours = period.timeslots.reduce(
    (acc, slot) => +slot.duration + acc,
    0,
  );

  const converter = use(ConverterContext);
  const revenue = sumDineros({
    dineros: slotsToDineros(period.timeslots),
    currency: converter.preferredCurrency,
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

  const { Root, Trigger, Content, Header, Title, Description, Body } =
    useResponsiveSheet();

  return (
    <Root open={newPeriodDialogOpen} onOpenChange={setNewPeriodDialogOpen}>
      <Trigger asChild>
        <Button>Close Period</Button>
      </Trigger>
      <Content>
        <Header>
          <Title>Close Period</Title>
          <Description>
            Closing a period marks the end of this billing period. You can
            choose to open a new one for the upcoming billing period, or close
            this one without opening a new one.
          </Description>
        </Header>
        <Body className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>New Period Start</Label>
            <DatePicker
              buttonClassName="w-full"
              required
              date={newPeriodStart}
              setDate={setNewPeriodStart}
            />
          </div>
          <div className="flex flex-col gap-1 lg:w-full">
            <Label>New Period End</Label>
            <DatePicker
              buttonClassName="w-full"
              required
              date={newPeriodEnd}
              setDate={setNewPeriodEnd}
            />
          </div>
        </Body>
        <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:*:w-auto sm:flex-row">
          <Button
            className="flex-1"
            variant="secondary"
            onClick={async () => {
              await closePeriod({
                id: props.period.id,
                openNewPeriod: false,
              });
              setNewPeriodDialogOpen(false);
            }}
          >
            Close Period
          </Button>
          <Button
            className="flex-1"
            onClick={async () => {
              await closePeriod({
                id: props.period.id,
                openNewPeriod: true,
                clientId: props.period.client.id,
                periodStart: newPeriodStart.toString(),
                periodEnd: newPeriodEnd.toString(),
              });
              setNewPeriodDialogOpen(false);
            }}
          >
            Close and Open New
          </Button>
        </div>
      </Content>
    </Root>
  );
}

export function ClosePeriodSheet(props: {
  openPeriods: TsonSerialized<Period[]>;
}) {
  const openPeriods = tson.deserialize(props.openPeriods);
  const [hasDismissed, setHasDismissed] = useLocalStorage<number | null>(
    "close-period-sheet-dismissed",
    null,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const hasExpiredPeriods = openPeriods.some((period) =>
      isPast(period.endDate),
    );
    const dismissed = hasDismissed ? new Date(hasDismissed) : null;
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);
    if (hasExpiredPeriods && dismissed && dismissed > oneHourAgo) return;
    setDialogOpen(hasExpiredPeriods);
  }, [openPeriods, hasDismissed]);

  const { Root, Trigger, Content, Header, Title, Description, Body } =
    useResponsiveSheet();

  return (
    <Root>
      <Trigger asChild>
        <Button>Periods</Button>
      </Trigger>
      <Content>
        <Header className="mb-4">
          <Title>Open Periods</Title>
          <Description>
            {`You have ${openPeriods.length} open periods.`}
          </Description>
        </Header>
        <Body className="flex flex-col gap-4">
          {openPeriods.map((period, idx) => (
            <Fragment key={period.id}>
              <PeriodCard period={period} />
              {idx < openPeriods.length - 1 && <Separator />}
            </Fragment>
          ))}
        </Body>
      </Content>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>You have expired periods.</AlertDialogTitle>
          <AlertDialogDescription>
            It is recommended that you close expired periods.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setHasDismissed(Date.now());
              }}
            >
              Remind me later
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Trigger asChild>
                <Button variant="secondary">Manage</Button>
              </Trigger>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Root>
  );
}
