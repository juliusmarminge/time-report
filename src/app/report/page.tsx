import { Suspense } from "react";
import { redirect } from "next/navigation";
import { format, parseISO, startOfMonth } from "date-fns";
import { toDecimal } from "dinero.js";

import type { Client, Timeslot } from "~/db/getters";
import { getClients, getOpenPeriods, getTimeslots } from "~/db/getters";
import { currentUser } from "~/lib/auth";
import { withUnstableCache } from "~/lib/cache";
import type { CurrencyCode } from "~/lib/currencies";
import { formatMoney } from "~/lib/currencies";
import { getMonthMetadata } from "~/lib/get-month-metadata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { DashboardShell } from "../../components/dashboard-shell";
import { Calendar } from "./_components/calendar";
import { ClosePeriodSheet } from "./_components/close-periods";
import { ReportTimeSheet } from "./_components/report-time-form";
import { TimeslotCard } from "./_components/timeslot-card";

export const runtime = "edge";

export default async function IndexPage(props: {
  searchParams: { date?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  if (!props.searchParams.date) {
    redirect("/report?date=" + format(new Date(), "yyyy-MM-dd"));
  }
  const date = parseISO(`${props.searchParams.date}T00:00:00.000Z`);

  const clients = await withUnstableCache({
    fn: getClients,
    args: [user.id],
    tags: ["clients"],
  });

  console.log("Got clients for userId", user.id, clients);

  const timeslots = await withUnstableCache({
    fn: getTimeslots,
    args: [startOfMonth(date ?? new Date()), user.id, { mode: "month" }],
    tags: ["timeslots"],
  });

  const monthSlots = timeslots.filter(
    (slot) =>
      format(slot.date, "yyyy-MM") === format(date ?? new Date(), "yyyy-MM"),
  );

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

  const selectedDaySlots = date
    ? slotsByDate?.[format(date, "yyyy-MM-dd")] ?? []
    : [];

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
        <Calendar date={date} timeslots={slotsByDate} />

        <SidePanel
          date={date}
          clients={clients}
          timeslots={selectedDaySlots}
          currency={user.defaultCurrency}
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

  console.log("Got open periods for userId", user.id, openPeriods);

  return <ClosePeriodSheet openPeriods={openPeriods} />;
}

async function SidePanel(props: {
  date?: Date;
  clients: Client[];
  timeslots: Timeslot[];
  currency: CurrencyCode;
}) {
  if (!props.date) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">No date selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a date to view timeslots.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { totalRevenue, totalHours } = await getMonthMetadata(
    props.timeslots,
    props.currency,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {format(props.date, "EEEE, MMMM do")}
        </CardTitle>
        <CardDescription>
          {totalHours} hours billed for a total of{" "}
          {toDecimal(totalRevenue, formatMoney)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {props.timeslots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No timeslots for this date.
          </p>
        )}
        {props.timeslots.map((slot) => (
          <TimeslotCard key={slot.id} slot={slot} />
        ))}
        <Suspense>
          <ReportTimeSheet clients={props.clients} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
