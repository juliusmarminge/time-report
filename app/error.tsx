"use client";

import { useEffect } from "react";

import { DashboardShell } from "~/app/_components/dashboard-shell";
import { Button } from "~/ui/button";

export default function ErrorPage(props: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(props.error);
  }, [props.error]);

  return (
    <DashboardShell title="Error">
      <div className="flex h-[600px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
        <h2 className="font-bold text-xl">{"Something went wrong"}</h2>
        <Button onClick={props.reset}>Try again</Button>
      </div>
    </DashboardShell>
  );
}
