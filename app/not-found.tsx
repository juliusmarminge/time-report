import Link from "next/link";

import { DashboardShell } from "~/app/_components/dashboard-shell";
import { buttonVariants } from "~/ui/button";

export default function NotFound() {
  return (
    <DashboardShell title="Not Found">
      <div className="flex items-center justify-center border border-dashed p-48">
        <div className="flex flex-col gap-2 font-semibold text-lg">
          The resource you are looking for does not exist.
          <Link href="/" className={buttonVariants({ variant: "accent" })}>
            Go back home
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
