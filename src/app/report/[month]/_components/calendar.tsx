"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDayRender } from "react-day-picker";

import type { Client, Timeslot } from "~/db/getters";
import { cn } from "~/lib/cn";
import type { CurrencyCode } from "~/lib/currencies";
import { Button } from "~/ui/button";
import { Calendar as CalendarCore } from "~/ui/calendar";
import { SidePanel } from "./side-panel";

export function Calendar(props: {
  date: Date;
  setDate: (date: Date) => void;
  timeslots: Record<string, Timeslot[]> | null;
}) {
  const { timeslots } = props;
  const [month, setMonth] = useState(props.date);
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
      selected={props.date}
      month={month}
      onMonthChange={(month) => {
        const url = new URL(window.location.href);
        url.pathname = `/report/${format(month, "MMMyy")}`;

        startTransition(() => {
          router.push(url.href, { scroll: false });
          setMonth(month);
        });
      }}
      onSelect={(date) => {
        if (!date) return;

        const url = new URL(window.location.href);
        url.pathname = `/report/${format(date, "MMMyy")}`;
        startTransition(() => {
          router.push(url.href, { scroll: false });
          setMonth(date);
          props.setDate(date);
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
  referenceDate: Date;
  timeslots: Record<string, Timeslot[]> | null;
  clients: Client[];
  userCurrency: CurrencyCode;
  conversionRates: Record<CurrencyCode, number>;
}) {
  const [date, setDate] = useState(props.referenceDate);
  const selectedDaySlots = props.timeslots?.[format(date, "yyyy-MM-dd")] ?? [];

  return (
    <>
      <Calendar date={date} setDate={setDate} timeslots={props.timeslots} />
      <SidePanel
        date={date}
        clients={props.clients}
        timeslots={selectedDaySlots}
        currency={props.userCurrency}
        conversionRates={props.conversionRates}
      />
    </>
  );
}
