import { Temporal } from "@js-temporal/polyfill";
import { subtract, toDecimal } from "dinero.js";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardShell } from "~/app/_components/dashboard-shell";
import { currentUser } from "~/auth";
import { getMonthMetadata } from "~/lib/get-month-metadata";
import { isSameMonth, parseMonthParam } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import { formatDiff, formatMoney } from "~/monetary/math";
import type { Timeslot } from "~/trpc/datalayer";
import * as trpc from "~/trpc/datalayer";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { CalendarAndSidePanel } from "./_components/calendar";
import { ClosePeriodSheet } from "./_components/close-periods";
import { User } from "next-auth";

export default async function IndexPage(props: { params: { month: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  if (props.params.month.length !== 5) {
    redirect(
      `/report/${Temporal.Now.plainDateISO()
        .toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        })
        .replace(" ", "")}`,
    );
  }

  const date = parseMonthParam(props.params.month);

  // const clients = await withUnstableCache({
  //   fn: trpc.getClients,
  //   args: [],
  //   tags: [CACHE_TAGS.CLIENTS],
  // });
  // const timeslots = await withUnstableCache({
  //   fn: trpc.getTimeslots,
  //   args: [{ date, mode: "month" }],
  //   tags: [CACHE_TAGS.TIMESLOTS],
  // });

  const lastMonthDate = date.subtract({ months: 1 });

  const [clients, timeslots, lastMonthTimeslots] = await Promise.all([
    trpc.getClients(),
    trpc.getTimeslots({ date, mode: "month" }),
    trpc.getTimeslots({ date: lastMonthDate, mode: "month" }),
  ]);

  const monthSlots = timeslots.filter((slot) => isSameMonth(slot.date, date));
  const lastMonthSlots = lastMonthTimeslots.filter((slot) =>
    isSameMonth(slot.date, lastMonthDate),
  );
  const [
    { billedClients, totalHours, totalRevenue },
    { totalHours: lastMonthTotalHours, totalRevenue: lastMonthTotalRevenue },
  ] = await Promise.all([
    getMonthMetadata(monthSlots, user.defaultCurrency),
    getMonthMetadata(lastMonthSlots, user.defaultCurrency),
  ]);

  const diff = subtract(totalRevenue, lastMonthTotalRevenue);

  const slotsByDate = timeslots.reduce<Record<string, Timeslot[]>>(
    (acc, slot) => {
      const key = slot.date.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    },
    {},
  );

  return (
    <DashboardShell
      title="Report Time"
      description="Browse how your business is doing this month and report time."
      className="gap-4"
      headerActions={[
        <Suspense>
          <ClosePeriod />
        </Suspense>,
      ]}
    >
      <section className="flex gap-4 overflow-x-scroll md:grid lg:grid-cols-3 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="font-bold text-2xl">
              {toDecimal(totalRevenue, formatMoney)}
            </div>
            <p className="text-muted-foreground text-xs">
              {formatDiff(toDecimal(diff, formatMoney))} since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Billed time</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="font-bold text-2xl">
              {totalHours}
              <span className="ml-1 text-lg">hours</span>
            </div>
            <p className="text-muted-foreground text-xs">
              {formatDiff(totalHours - lastMonthTotalHours)} hours from last
              month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="font-bold text-2xl">
              {billedClients}
              <span className="ml-1 text-lg">billed this month</span>
            </div>
            <p className="text-muted-foreground text-xs">
              out of {clients.length} total clients
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4 md:grid lg:grid-cols-4 md:grid-cols-2">
        <CalendarAndSidePanel
          referenceDate={tson.serialize(date)}
          clients={tson.serialize(clients)}
          timeslots={tson.serialize(slotsByDate)}
        />
      </section>
    </DashboardShell>
  );
}

async function ClosePeriod() {
  // const openPeriods = await withUnstableCache({
  //   fn: trpc.getOpenPeriods,
  //   args: [],
  //   tags: [CACHE_TAGS.PERIODS],
  // });
  const openPeriods = await trpc.getOpenPeriods();

  return <ClosePeriodSheet openPeriods={tson.serialize(openPeriods)} />;
}
