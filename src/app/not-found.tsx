import Link from "next/link";

import { DashboardShell } from "~/components/dashboard-shell";
import { buttonVariants } from "~/ui/button";

// export const runtime = "edge";

export default function NotFound() {
  return (
    <DashboardShell title="Not Found">
      <div className="flex items-center justify-center border border-dashed p-48">
        <div className="flex flex-col gap-2 text-lg font-semibold">
          The resource you are looking for does not exist.
          <Link href="/" className={buttonVariants({ variant: "accent" })}>
            Go back home
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
