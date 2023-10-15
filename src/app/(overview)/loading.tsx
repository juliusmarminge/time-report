import { headers } from "next/headers";
import { format } from "date-fns";

import { DashboardShell } from "~/components/dashboard-shell";
import { Button } from "~/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { Calendar } from "./_components/calendar";

export default function Loading() {
  let date = new Date();
  try {
    console.log(Object.fromEntries(headers().entries()));
    const requestUrl = new URL(headers().get("referer") ?? "");
    const dateParam = requestUrl.searchParams.get("date");
    if (dateParam) {
      date = new Date(dateParam);
    }
  } catch {
    // ignore
  }

  return (
    <DashboardShell
      title="Overview"
      description="Browse a summary of how your business is doing this month."
      className="gap-4"
      headerActions={[<Button>Periods</Button>]}
    >
      <section className="flex gap-4 overflow-x-scroll md:grid md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="w-1/3 animate-pulse rounded bg-muted-foreground text-2xl font-bold">
              &nbsp;
            </div>
            <p className="w-1/2 animate-pulse rounded bg-muted text-xs text-muted-foreground">
              &nbsp;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billed time</CardTitle>
          </CardHeader>
          <CardContent className="w-max md:w-auto">
            <div className="w-1/3 animate-pulse rounded bg-muted-foreground text-2xl font-bold">
              &nbsp;
            </div>
            <p className="w-1/2 animate-pulse rounded bg-muted text-xs text-muted-foreground">
              &nbsp;
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
            <div className="w-1/3 animate-pulse rounded bg-muted-foreground text-2xl font-bold">
              &nbsp;
            </div>
            <p className="w-1/2 animate-pulse rounded bg-muted text-xs text-muted-foreground">
              &nbsp;
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4 sm:grid md:grid-cols-2 lg:grid-cols-4">
        <Calendar date={date} timeslots={{}} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {format(date, "EEEE, MMMM do")}
            </CardTitle>
            <CardDescription className="animate-pulse rounded bg-muted-foreground">
              &nbsp;
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="animate-pulse bg-muted">
                <div className="flex items-start p-6">
                  <CardHeader className="p-0">
                    <CardTitle>&nbsp;</CardTitle>
                  </CardHeader>
                </div>
                <CardContent>
                  <p className="text-base font-bold text-muted-foreground">
                    &nbsp;
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  );
}
