import { currentUser } from "~/auth";
import { ConverterProvider } from "~/monetary/context";
import { getCurrencyRates } from "~/monetary/rsc";
import { MobileControlledNavigation, MySidebar } from "./_components/nav";
import * as trpc from "~/trpc/datalayer";
import { tson } from "~/lib/tson";

export default function AppLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const userPromise = currentUser({ redirect: true });
  const openPeriodsPromise = trpc.getOpenPeriods().then(tson.serialize);
  const recentPeriodsPromise = trpc
    .getRecentlyClosedPeriods()
    .then(tson.serialize);
  return (
    <ConverterProvider user={userPromise} rates={getCurrencyRates()}>
      <div className="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col dark:bg-zinc-900 dark:lg:bg-zinc-950 lg:bg-zinc-100">
        {/* Desktop sidebar, Mobile navigation */}
        <div className="fixed inset-y-0 left-0 w-64 max-lg:hidden">
          <MySidebar
            userPromise={userPromise}
            openPeriodsPromise={openPeriodsPromise}
            recentPeriodsPromise={recentPeriodsPromise}
          />
        </div>
        <MobileControlledNavigation
          userPromise={userPromise}
          openPeriodsPromise={openPeriodsPromise}
          recentPeriodsPromise={recentPeriodsPromise}
        />

        <main className="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
          <div className="grow p-6 lg:rounded-lg dark:lg:bg-zinc-900 lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-border">
            {props.children}
          </div>
        </main>
      </div>
    </ConverterProvider>
  );
}
