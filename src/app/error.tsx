"use client";

import { useEffect } from "react";

import { DashboardShell } from "~/components/dashboard-shell";
import { Button } from "~/ui/button";

export const runtime = "edge";

export default function Error(props: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(props.error);
  }, [props.error]);

  return (
    <DashboardShell title="Error">
      <div className="flex h-[600px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
        <h2 className="text-xl font-bold">{`Something went wrong`}</h2>
        <Button onClick={props.reset}>Try again</Button>
      </div>
    </DashboardShell>
  );
}
