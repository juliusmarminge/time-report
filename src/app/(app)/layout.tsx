import { currentUser } from "~/auth";
import { ConverterProvider } from "~/monetary/context";
import { getCurrencyRates } from "~/monetary/rsc";
import { MobileControlledNavigation, MySidebar } from "./_components/nav";
import { trpc, HydrateClient } from "~/trpc/server";
import { ClosePeriodSheet } from "./_components/close-periods";
import { TRPCProvider } from "~/trpc/client";

export const dynamic = "force-dynamic";

export default function AppLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const userPromise = currentUser({ redirect: true });

  void trpc.listPeriods.prefetch({ filter: "open" });
  void trpc.listPeriods.prefetch({ filter: "recently-closed" });

  return (
    <TRPCProvider>
      <ConverterProvider user={userPromise} rates={getCurrencyRates()}>
        <HydrateClient>
          <div className="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col dark:bg-zinc-900 dark:lg:bg-zinc-950 lg:bg-zinc-100">
            <div className="fixed inset-y-0 left-0 w-64 max-lg:hidden">
              <MySidebar userPromise={userPromise} />
            </div>
            <MobileControlledNavigation userPromise={userPromise} />

            <main className="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pt-2 lg:pr-2 lg:pl-64">
              <div className="grow p-6 lg:rounded-lg dark:lg:bg-zinc-900 lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-border">
                {props.children}
              </div>
            </main>
          </div>

          <ClosePeriodSheet />
        </HydrateClient>
      </ConverterProvider>
    </TRPCProvider>
  );
}
