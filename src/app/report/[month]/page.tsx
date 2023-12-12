import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Temporal } from "@js-temporal/polyfill";
import { toDecimal } from "dinero.js";

import type { Timeslot } from "~/db/queries";
import { getClients, getOpenPeriods, getTimeslots } from "~/db/queries";
import { currentUser } from "~/lib/auth";
import { withUnstableCache } from "~/lib/cache";
import { createConverter, formatMoney } from "~/lib/currencies";
import { getMonthMetadata } from "~/lib/get-month-metadata";
import { isSameMonth } from "~/lib/temporal";
import { tson } from "~/lib/tson";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { CalendarAndSidePanel } from "./_components/calendar";
import { ClosePeriodSheet } from "./_components/close-periods";

export const runtime = "edge";

const parseMonthParam = (month: string) => {
  // MMMyy => jan23 for example, parse it to a Temporal.PlainDate { 2023-01-01 }
  const [monthCode, yearNr] = month.match(/\d+|\D+/g) as string[];
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

  return Temporal.PlainDate.from({
    year: 2000 + +yearNr,
    month: monthNr,
    day: 1,
  });
};

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

  const clients = await withUnstableCache({
    fn: getClients,
    args: [user.id],
    tags: ["clients"],
  });

  const timeslots = await withUnstableCache({
    fn: getTimeslots,
    args: [date, user.id, { mode: "month" }],
    tags: ["timeslots"],
  });

  console.log("timeslots", timeslots);

  const monthSlots = timeslots.filter((slot) => isSameMonth(slot.date, date));

  console.log("monthSlots", monthSlots);

  const converter = await createConverter();

  const { billedClients, totalHours, totalRevenue } = await getMonthMetadata(
    monthSlots,
    user.defaultCurrency,
  );

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
      <section className="flex gap-4 overflow-x-scroll md:grid md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="text-2xl font-bold">
              {toDecimal(totalRevenue, formatMoney)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{toDecimal(totalRevenue, formatMoney)} since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billed time</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="text-2xl font-bold">
              {totalHours}
              <span className="ml-1 text-lg">hours</span>
            </div>
            <p className="text-xs text-muted-foreground">
              +{totalHours} hours from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="text-2xl font-bold">
              {billedClients}
              <span className="ml-1 text-lg">billed this month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              out of {clients.length} total clients
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4 sm:grid md:grid-cols-2 lg:grid-cols-4">
        <CalendarAndSidePanel
          referenceDate={tson.serialize(date)}
          clients={tson.serialize(clients)}
          timeslots={tson.serialize(slotsByDate)}
          userCurrency={user.defaultCurrency}
          conversionRates={converter.rates}
        />
      </section>
    </DashboardShell>
  );
}

async function ClosePeriod() {
  const user = await currentUser();
  if (!user) return null;

  const openPeriods = await withUnstableCache({
    fn: getOpenPeriods,
    args: [user.id],
    tags: ["periods"],
  });

  const converter = await createConverter();

  return (
    <ClosePeriodSheet
      openPeriods={tson.serialize(openPeriods)}
      conversionRates={converter.rates}
      userCurrency={user.defaultCurrency}
    />
  );
}
