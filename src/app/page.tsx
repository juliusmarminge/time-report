import { DashboardShell } from "~/app/_components/dashboard-shell";

export default function Page() {
  return (
    <DashboardShell
      title="Time Report"
      description="Welcome to Time Report, a simple time reporting app for indie
      contractors."
      className="max-w-2xl gap-6"
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">How to use?</h2>
        <p className="text-base text-muted-foreground">
          Time Report has 3 main concepts, <b>Clients</b>, <b>Periods</b> and{" "}
          <b>Slots</b>.
        </p>
        <h3 className="font-semibold">Clients</h3>
        <p className="text-base text-muted-foreground">
          Clients are... well your clients that you report time for. When
          creating clients you'll provide the currency that you invoice them in,
          your default hourly rate as well as what billing period you use for
          that client. For example, you may invoice a client $100 USD per hour
          and send them an invoice every month.
        </p>

        <h3 className="font-semibold">Periods</h3>
        <p className="text-base text-muted-foreground">
          Periods corresponds to the billing period that you use for a client.
          For the above example, you'll have a period for each month. At the end
          of the month, you'll get notified to close that period and create a
          new one so that you can easily keep track of what you have invoiced
          and not.
        </p>

        <h3 className="font-semibold">Slots</h3>
        <p className="text-base text-muted-foreground">
          Each period gets filled with a bunch of Slots. Slots are time entries
          with a duration, currency and amount (which defaults to your default
          hourly rate for that client). You can add as many slots as you want to
          a period and Time Report will calculate the total amount for you.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Core Features</h2>
        <p className="text-base text-muted-foreground">
          Time Report aims to be as simple as possible, the main features we aim
          to solve are:
        </p>

        <h3 className="font-semibold">
          Easily report time for multiple clients
        </h3>
        <p className="text-base text-muted-foreground">
          Most existing apps are made for companies with lots of employees that
          reports their time for a single company. Time Report takes a different
          stance and focuses on contractors that invoice multiple companies.
        </p>

        <h3 className="font-semibold">Tracking your month</h3>
        <p className="text-base text-muted-foreground">
          Easily keep track of how many hours you've worked for each of your
          clients, and how much you'll end up invoicing them at the end of the
          period. You'll also get aggregate information for all your differnet
          clients in a single place.
        </p>

        <h3 className="font-semibold">Automatic currency converting.</h3>
        <p className="text-base text-muted-foreground">
          Invoicing clients in different currencies? No worries, set your
          preferred currency and we'll convert the total to that currency.
        </p>
      </div>
    </DashboardShell>
  );
}
