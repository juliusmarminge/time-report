import { format } from "date-fns";

import type { Period } from "~/db/getters";
import { Button } from "~/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/sheet";

export function ClosePeriodSheet(props: { openPeriods: Period[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Periods</Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Open Periods</SheetTitle>
            <SheetDescription>
              {`You have ${props.openPeriods.length} open periods. Closing a period will open a new one with the same duration.`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            {props.openPeriods.map(({ client, period }) => (
              <div key={period.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{client.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(period.startDate, "MMM do")} to{" "}
                    {format(period.endDate, "MMM do")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">timeslots</p>
                <div className="flex flex-col gap-2">
                  <Button>Close Period</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
