"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDayRender } from "react-day-picker";

import type { Timeslot } from "~/db/getters";
import { cn } from "~/lib/cn";
import { Button } from "~/ui/button";
import { Calendar as CalendarCore } from "~/ui/calendar";

export function Calendar(props: {
  date?: Date;
  timeslots: Record<string, Timeslot[]> | null;
}) {
  const { date: selectedDate, timeslots } = props;
  const router = useRouter();

  return (
    <CalendarCore
      className="col-span-3 h-full overflow-y-scroll"
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        const url = new URL(window.location.href);
        if (date) {
          url.searchParams.set("date", format(date, "yyyy-MM-dd"));
        } else {
          url.searchParams.delete("date");
        }
        router.push(url.href, { scroll: false });
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
