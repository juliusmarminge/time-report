"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Temporal } from "@js-temporal/polyfill";
import { format } from "date-fns";
import { useDayRender } from "react-day-picker";
import type { TsonSerialized } from "tupleson";

import type { Client, Timeslot } from "~/db/queries";
import { cn } from "~/lib/cn";
import type { CurrencyCode } from "~/lib/currencies";
import { fromDate, toDate } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import { Button } from "~/ui/button";
import { Calendar as CalendarCore } from "~/ui/calendar";
import { SidePanel } from "./side-panel";

export function Calendar(props: {
  date: Temporal.PlainDate;
  setDate: (date: Temporal.PlainDate) => void;
  timeslots: Record<string, Timeslot[]> | null;
}) {
  const { timeslots } = props;
  const [displayMonth, setDisplayMonth] = useState(props.date);
  const router = useRouter();

  const [_, startTransition] = useTransition();

  return (
    <CalendarCore
      ISOWeek
      captionLayout="dropdown-buttons"
      className="col-span-3 h-full overflow-y-scroll"
      classNames={{
        month: "w-full space-y-4",
        head_cell:
          "flex-1 text-left px-4 text-muted-foreground text-[0.8rem] font-normal",
        caption_label: "text-lg font-medium",
        cell: "relative flex-1 p-0 text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
      }}
      mode="single"
      selected={toDate(props.date)}
      month={toDate(displayMonth)}
      onMonthChange={(newMonth) => {
        const temporal = fromDate(newMonth);
        if (
          temporal.year === displayMonth.year &&
          temporal.month === displayMonth.month
        ) {
          return;
        }

        const url = new URL(window.location.href);
        url.pathname = `/report/${format(newMonth, "MMMyy")}`;

        startTransition(() => {
          setDisplayMonth(temporal);
          router.push(url.href, { scroll: false });
        });
      }}
      onSelect={(date) => {
        if (!date) return;
        const temporal = fromDate(date);
        if (
          temporal.year === props.date.year &&
          temporal.month === props.date.month
        ) {
          props.setDate(temporal);
          return;
        }

        const url = new URL(window.location.href);
        url.pathname = `/report/${format(date, "MMMyy")}`;
        startTransition(() => {
          setDisplayMonth(temporal);
          props.setDate(temporal);
          router.push(url.href, { scroll: false });
        });
      }}
      components={{
        Day: (props) => {
          const buttonRef = useRef<HTMLButtonElement>(null);
          const day = useDayRender(props.date, props.displayMonth, buttonRef);

          const slots = timeslots?.[format(props.date, "yyyy-MM-dd")];

          return (
            <Button
              ref={buttonRef}
              variant="ghost"
              {...day.buttonProps}
              className={cn(
                day.buttonProps.className,
                "h-36 w-full flex-col items-start justify-start p-4 font-normal aria-selected:opacity-100",
              )}
            >
              <span className="text-lg font-bold">
                {format(props.date, "d")}
              </span>
              {slots?.map((slot) => (
                <div className="text-xs" key={slot.id}>
                  {slot.clientName} ({slot.duration}h)
                </div>
              ))}
            </Button>
          );
        },
      }}
    />
  );
}

export function CalendarAndSidePanel(props: {
  referenceDate: TsonSerialized<Temporal.PlainDate>;
  timeslots: TsonSerialized<Record<string, Timeslot[]> | null>;
  clients: TsonSerialized<Client[]>;
  userCurrency: CurrencyCode;
  conversionRates: Record<CurrencyCode, number>;
}) {
  const clients = tson.deserialize(props.clients);
  const temporal = tson.deserialize(props.referenceDate);
  const timeslots = tson.deserialize(props.timeslots);

  const [date, setDate] = useState(temporal);
  const selectedDaySlots = timeslots?.[date.toString()] ?? [];

  return (
    <>
      <Calendar date={date} setDate={setDate} timeslots={timeslots} />
      <SidePanel
        date={date}
        clients={clients}
        timeslots={selectedDaySlots}
        currency={props.userCurrency}
        conversionRates={props.conversionRates}
      />
    </>
  );
}
