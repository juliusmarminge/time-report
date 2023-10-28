import { Temporal } from "@js-temporal/polyfill";
import { format, parse } from "date-fns";

// --- NEEDED ONLY TO CONVERT FOR DATE PICKER. DON'T USE ELSEWHERE ---
export const toDate = (date: Temporal.PlainDate) =>
  parse(date.toString(), "yyyy-MM-dd", new Date());

export const fromDate = (date: Date) =>
  Temporal.PlainDate.from(format(date, "yyyy-MM-dd"));
// ---

export const isPast = (date: Temporal.PlainDate) => {
  const today = Temporal.Now.plainDate(date.getCalendar());
  return Temporal.PlainDate.compare(date, today) === -1;
};

export const isFuture = (date: Temporal.PlainDate) => {
  const today = Temporal.Now.plainDate(date.getCalendar());
  return Temporal.PlainDate.compare(date, today) === 1;
};

export const isSameMonth = (a: Temporal.PlainDate, b: Temporal.PlainDate) => {
  return a.year === b.year && a.month === b.month;
};

export const formatOrdinal = (
  date: Temporal.PlainDate,
  opts: Intl.DateTimeFormatOptions = {
    month: "short",
  },
) => {
  // format(2021-01-01) => Jan 21st
  const nthNumber = (number: number) => {
    if (number > 3 && number < 21) return "th";
    switch (number % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    date.toLocaleString("en-US", { ...opts, day: "numeric" }) +
    nthNumber(date.day)
  );
};
