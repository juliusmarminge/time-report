"use client";

import { use, useMemo } from "react";
import {
  Area,
  YAxis,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import type { Timeslot } from "~/trpc/datalayer";
import { tson } from "~/lib/tson";
import type { TsonSerialized } from "tupleson";
import { slotsToDineros, sumDineros, toNumber } from "~/monetary/math";
import { ConverterContext } from "~/monetary/context";

/**
 * FIXME: This isn't the most responsive thing in the world...
 */

export function ComparisonChart(
  props: Readonly<{
    a: TsonSerialized<Timeslot[]>;
    b: TsonSerialized<Timeslot[]>;
  }>,
) {
  const { convert, preferredCurrency } = use(ConverterContext);
  const a = tson.deserialize(props.a);
  const b = tson.deserialize(props.b);

  const data = useMemo(() => {
    const points: Array<{
      dayInMonth: number; // 1-31
      aSum: number; // accumulated until this day for this month
      bSum: number; // accumulated until this day for that month
    }> = [];

    for (let i = 0; i < 31; i++) {
      const dayInMonth = i + 1;
      const aSlots = a.filter((s) => s.date.day === dayInMonth);
      const bSlots = b.filter((s) => s.date.day === dayInMonth);

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

      points.push({
        dayInMonth,
        aSum: aSum + (points[i - 1]?.aSum ?? 0),
        bSum: bSum + (points[i - 1]?.bSum ?? 0),
      });
    }

    return points;
  }, [a, b, convert, preferredCurrency]);

  return (
    <ResponsiveContainer width={250} height="100%">
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        {/* <Tooltip /> */}
        {/* <XAxis dataKey="dayInMonth" fontSize={10} ticks={[1, 7, 14, 21, 28]} /> */}
        <YAxis
          fontSize={10}
          tickFormatter={(v) => {
            return Intl.NumberFormat(undefined, {
              maximumFractionDigits: 0,
            }).format(v);
          }}
        />
        <Area
          type="monotone"
          dataKey="aSum"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#gradient)"
        />
        <Line type="monotone" dataKey="bSum" stroke="#22c55e" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
