"use client";

import { Temporal } from "@js-temporal/polyfill";
import { use, useMemo } from "react";
import {
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { TsonSerialized } from "tupleson";
import { isFuture } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import { ConverterContext } from "~/monetary/context";
import { slotsToDineros, sumDineros, toNumber } from "~/monetary/math";
import type { Timeslot } from "~/trpc/datalayer";

const getTicks = (
  today: Temporal.PlainDate,
  month: Temporal.PlainDate,
  maxDay: number,
) => {
  const ticks = [1, 8, 15, 23, maxDay];
  if (month.month !== today.month) return ticks;

  // Replace the tick closest to the current day
  // to avoid collision. TODO: Is there CSS for this?
  const index = ticks.findIndex((t) => t >= today.day);
  if (index === -1) return ticks;
  delete ticks[index];
  return ticks;
};

/**
 * FIXME: This isn't the most responsive thing in the wor
 */

export function ComparisonChart(
  props: Readonly<{
    month: TsonSerialized<Temporal.PlainDate>;
    a: TsonSerialized<Timeslot[]>;
    b: TsonSerialized<Timeslot[]>;
  }>,
) {
  const { convert, preferredCurrency } = use(ConverterContext);
  const month = tson.deserialize(props.month);
  const a = tson.deserialize(props.a);
  const b = tson.deserialize(props.b);
  const today = Temporal.Now.plainDateISO();

  const maxDay = useMemo(
    () =>
      [...a, ...b].reduce(
        (acc, slot) => Math.max(acc, slot.date.daysInMonth),
        0,
      ),
    [a, b],
  );

  const data = useMemo(() => {
    const points: Array<{
      dayInMonth: number; // 1-31
      aSum: number | undefined; // accumulated until this day for this month
      bSum: number; // accumulated until this day for that month
    }> = [];

    for (let day = 1; day <= maxDay; day++) {
      const date = month.with({ day });
      const aSlots = a.filter((s) => s.date.day === date.day);
      const bSlots = b.filter((s) => s.date.day === date.day);

      // TODO: Pad A with prediction slots for the remaining days using ARIMA forecasts

      const aSum = toNumber(
        sumDineros({
          dineros: slotsToDineros(aSlots),
          converter: convert,
          currency: preferredCurrency,
        }),
      );
      const bSum = toNumber(
        sumDineros({
          dineros: slotsToDineros(bSlots),
          converter: convert,
          currency: preferredCurrency,
        }),
      );

      const aAcc = aSum + (points[day - 2]?.aSum ?? 0);
      const bAcc = bSum + (points[day - 2]?.bSum ?? 0);

      points.push({
        dayInMonth: date.day,
        aSum: !isFuture(date) ? aAcc : undefined,
        bSum: bAcc,
      });
    }

    return points;
  }, [a, b, maxDay, month, convert, preferredCurrency]);

  return (
    <ResponsiveContainer width={300} height="100%">
      <LineChart data={data} margin={{ bottom: -10, top: 0 }}>
        {/* <Tooltip /> */}
        <XAxis
          dataKey="dayInMonth"
          fontSize={10}
          ticks={getTicks(today, month, maxDay)}
        />
        <YAxis
          fontSize={10}
          tickFormatter={(v) => {
            return Intl.NumberFormat(undefined, {
              maximumFractionDigits: 0,
            }).format(v);
          }}
        />
        <Line
          type="monotone"
          dataKey="aSum"
          stroke="hsl(var(--primary))"
          dot={false}
          strokeWidth={2}
        />
        {month.month === today.month && (
          // @ts-expect-error - misaligned types
          <ReferenceLine x={today.day} stroke="hsl(var(--muted-foreground))">
            <Label value="Today" fontSize={10} position="bottom" />
          </ReferenceLine>
        )}
        <Line
          type="monotone"
          dataKey="bSum"
          stroke="hsl(var(--primary))"
          strokeOpacity={0.5}
          strokeDasharray="6 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
