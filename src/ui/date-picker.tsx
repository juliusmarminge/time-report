"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "~/lib/cn";
import { Button } from "~/ui/button";
import { Calendar } from "~/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";

export function DatePicker<TRequired extends boolean>(
  props: TRequired extends true
    ? {
        required: true;
        date: Date;
        setDate: (date: Date) => void;
      }
    : {
        required?: false;
        date?: Date;
        setDate: (date?: Date) => void;
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
          {props.date ? format(props.date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          ISOWeek
          mode="single"
          selected={props.date}
          month={props.date}
          onMonthChange={props.setDate}
          onSelect={(date) => {
            if (!date) {
              if (props.required) return;
              return props.setDate(undefined);
            }
            props.setDate(date);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
