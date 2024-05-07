"use client";

import { Temporal } from "@js-temporal/polyfill";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useDayRender } from "react-day-picker";
import type { TsonSerialized } from "tupleson";

import { cn } from "~/lib/cn";
import { tson } from "~/lib/tson";
import { useIsDesktop } from "~/lib/use-media-query";
import type { Client, Timeslot } from "~/trpc/datalayer";
import { Button } from "~/ui/button";
import { Calendar as CalendarCore } from "~/ui/calendar";
import { fromDate, toDate } from "~/ui/calendar";
import { Drawer, DrawerContent } from "~/ui/drawer";
import { SidePanel } from "./side-panel";

function Calendar(props: {
  date: Temporal.PlainDate;
  setDate: (date: Temporal.PlainDate) => void;
  onDayClick?: (date: Temporal.PlainDate | null) => void;
  timeslots: Record<string, Timeslot[]> | null;
}) {
  const { timeslots } = props;
  const today = Temporal.Now.plainDateISO();
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
        cell: "relative flex-1 p-0 text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent rounded-md",
      }}
      mode="single"
      toDate={toDate(today.with({ day: today.daysInMonth }))}
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
        Day: (dayProps) => {
          const buttonRef = useRef<HTMLButtonElement>(null);
          const day = useDayRender(
            dayProps.date,
            dayProps.displayMonth,
            buttonRef,
          );

          const slots = timeslots?.[format(dayProps.date, "yyyy-MM-dd")];

          return (
            <Button
              ref={buttonRef}
              variant="ghost"
              {...day.buttonProps}
              className={cn(
                day.buttonProps.className,
                "h-36 w-full flex-col items-start justify-start p-4 font-normal aria-selected:opacity-100",
                fromDate(dayProps.date).equals(props.date) && "bg-primary",
              )}
              onClick={(e) => {
                props.onDayClick?.(props.date);

                day.buttonProps.onClick?.(e);
              }}
            >
              <span className="font-bold text-lg">
                {format(dayProps.date, "d")}
              </span>
              {slots?.map((slot) => (
                <div className="text-xs" key={slot.id}>
                  {slot.client.name} ({slot.duration}h)
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
}) {
  const clients = tson.deserialize(props.clients);
  const temporal = tson.deserialize(props.referenceDate);
  const timeslots = tson.deserialize(props.timeslots);

  const [date, setDate] = useState(temporal);
  const selectedDaySlots = timeslots?.[date.toString()] ?? [];

  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const MaybeDrawer = (props: { children: React.ReactNode }) => {
    if (isDesktop) return props.children;
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>{props.children}</DrawerContent>
      </Drawer>
    );
  };

  return (
    <>
      <Calendar
        date={date}
        setDate={setDate}
        timeslots={timeslots}
        onDayClick={(date) => {
          if (isDesktop) return;
          setDrawerOpen(!!date);
        }}
      />
      <MaybeDrawer>
        <SidePanel
          date={date}
          clients={clients}
          timeslots={selectedDaySlots}
          className="border-none bg-background shadow-none lg:border lg:bg-card lg:shadow"
        />
      </MaybeDrawer>
    </>
  );
}
