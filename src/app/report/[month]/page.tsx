import { Suspense } from "react";
import { redirect } from "next/navigation";
import { format, parse } from "date-fns";
import { toDecimal } from "dinero.js";

import type { Timeslot } from "~/db/getters";
import { getClients, getOpenPeriods, getTimeslots } from "~/db/getters";
import { currentUser } from "~/lib/auth";
import { withUnstableCache } from "~/lib/cache";
import { createConverter, formatMoney } from "~/lib/currencies";
import { getMonthMetadata } from "~/lib/get-month-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { CalendarAndSidePanel } from "./_components/calendar";
import { ClosePeriodSheet } from "./_components/close-periods";

export const runtime = "edge";

export default async function IndexPage(props: { params: { month?: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  if (!props.params.month) {
    redirect("/report/" + format(new Date(), "MMMyy"));
  }
  const date = parse(props.params.month, "MMMyy", new Date());

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

  const monthSlots = timeslots.filter(
    (slot) =>
      format(slot.date, "yyyy-MM") === format(date ?? new Date(), "yyyy-MM"),
  );

  const converter = await createConverter();

  const { billedClients, totalHours, totalRevenue } = await getMonthMetadata(
    monthSlots,
    user.defaultCurrency,
  );

  const slotsByDate = timeslots.reduce<Record<string, Timeslot[]>>(
    (acc, slot) => {
      const date = format(slot.date, "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
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
        {/* <Card className="bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estimated income
            </CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="text-2xl font-bold">
              {toDecimal(
                dinero({
                  amount: 2375000,
                  currency: currencies[user.defaultCurrency],
                }),
                formatMoney,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              after fees and taxes
            </p>
          </CardContent>
        </Card> */}
      </section>

      <section className="flex flex-col gap-4 sm:grid md:grid-cols-2 lg:grid-cols-4">
        <CalendarAndSidePanel
          referenceDate={date}
          clients={clients}
          timeslots={slotsByDate}
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
      openPeriods={openPeriods}
      conversionRates={converter.rates}
      userCurrency={user.defaultCurrency}
    />
  );
}
