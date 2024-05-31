import { Temporal } from "@js-temporal/polyfill";

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

export const toMonthParam = (date?: Temporal.PlainDate) => {
  return (date ?? Temporal.Now.plainDateISO())
    .toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    })
    .replace(" ", "");
};

export const parseMonthParam = (month: string) => {
  // MMMyy => jan23 for example, parse it to a Temporal.PlainDate { 2023-01-01 }
  const [monthCode, yearNr] = month.match(/\d+|\D+/g) as [string, string];
  const monthNr =
    [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].indexOf(monthCode.toLowerCase()) + 1;

  const today = Temporal.Now.plainDateISO();
  const temporal = Temporal.PlainDate.from({
    year: 2000 + +yearNr,
    month: monthNr,
    day: 1,
  });
  if (temporal.year === today.year && temporal.month === today.month) {
    return today;
  }
  return temporal;
};
