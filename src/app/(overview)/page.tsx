import { redirect } from "next/navigation";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { add, dinero, multiply, toDecimal } from "dinero.js";

import type { Client, Timeslot } from "~/db/getters";
import { getClients, getTimeslots } from "~/db/getters";
import { currentUser } from "~/lib/auth";
import { createConverter, currencies, formatMoney } from "~/lib/currencies";
import { Button } from "~/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { DashboardShell } from "../../components/dashboard-shell";
import { Calendar } from "./calendar";
import { ReportTimeSheet } from "./report-time-form";
import { TimeslotCard } from "./timeslot-card";

export const runtime = "edge";

export default async function IndexPage(props: {
  searchParams: { date?: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const date = props.searchParams.date
    ? parseISO(props.searchParams.date ?? "")
    : undefined;

  const clients = await getClients();
  const timeslots = await getTimeslots(date ?? new Date(), { mode: "month" });

  const billedClients = new Set(timeslots.map((slot) => slot.clientId)).size;

  const totalHours = timeslots.reduce((acc, slot) => {
    return acc + Number(slot.duration);
  }, 0);

  const convert = await createConverter();
  const totalRevenue = timeslots.reduce(
    (acc, slot) => {
      const dineroObject = dinero({
        amount: slot.chargeRate,
        currency: currencies[slot.currency],
      });
      const inUSD = convert(dineroObject, "USD");

      console.log({
        dineroObject: dineroObject.toJSON(),
        dineroObjectAmount: toDecimal(dineroObject, formatMoney),
        inUSD: inUSD.toJSON(),
        inUSDAmount: toDecimal(inUSD, formatMoney),
      });

      return add(acc, multiply(inUSD, Number(slot.duration)));
    },
    dinero({ amount: 0, currency: currencies.USD }),
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
      title="Overview"
      description="Browse a summary of how your business is doing this month."
      className="gap-4"
      headerActions={[
        <Button size="icon" variant="outline">
          <HamburgerMenuIcon className="h-5 w-5" />
        </Button>,
        <Button>Close month</Button>,
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
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
          <CardContent>
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
          <CardContent>
            <div className="text-2xl font-bold">
              {billedClients}
              <span className="ml-1 text-lg">billed this month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              out of {clients.length} total clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estimated income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,750</div>
            <p className="text-xs text-muted-foreground">
              after fees and taxes
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Calendar date={date} timeslots={slotsByDate} />

        <SidePanel date={date} clients={clients} timeslots={selectedDaySlots} />
      </section>
    </DashboardShell>
  );
}

async function SidePanel(props: {
  date?: Date;
  clients: Client[];
  timeslots: Timeslot[];
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

  const totalHours = props.timeslots.reduce((acc, slot) => {
    return acc + Number(slot.duration);
  }, 0);
  const convert = await createConverter();
  const totalRevenue = props.timeslots.reduce(
    (acc, slot) => {
      const dineroObject = dinero({
        amount: slot.chargeRate,
        currency: currencies[slot.currency],
      });
      const inUSD = convert(dineroObject, "USD");

      console.log({
        dineroObject: dineroObject.toJSON(),
        dineroObjectAmount: toDecimal(dineroObject, formatMoney),
        inUSD: inUSD.toJSON(),
        inUSDAmount: toDecimal(inUSD, formatMoney),
      });

      return add(acc, multiply(inUSD, Number(slot.duration)));
    },
    dinero({ amount: 0, currency: currencies.USD }),
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
        <ReportTimeSheet clients={props.clients} />
      </CardContent>
    </Card>
  );
}
