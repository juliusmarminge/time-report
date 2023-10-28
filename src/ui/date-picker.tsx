"use client";

import * as React from "react";
import type { Temporal } from "@js-temporal/polyfill";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "~/lib/cn";
import { fromDate, toDate } from "~/lib/temporal";
import { Button } from "~/ui/button";
import { Calendar } from "~/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";

export function DatePicker<TRequired extends boolean>(
  props: TRequired extends true
    ? {
        required: true;
        date: Temporal.PlainDate;
        setDate: (date: Temporal.PlainDate) => void;
      }
    : {
        required?: false;
        date?: Temporal.PlainDate;
        setDate: (date?: Temporal.PlainDate) => void;
      },
) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !props.date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.date ? (
            format(toDate(props.date), "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          ISOWeek
          mode="single"
          selected={props.date ? toDate(props.date) : undefined}
          month={props.date ? toDate(props.date) : undefined}
          onMonthChange={(date) => {
            props.setDate(fromDate(date));
          }}
          onSelect={(date) => {
            if (!date) {
              if (props.required) return;
              return props.setDate(undefined);
            }
            props.setDate(fromDate(date));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
