import { BackgroundGradient } from "./_components/gradient";

import { Link } from "~/ui/link";

import { ArrowRightIcon } from "@heroicons/react/16/solid";
import { Suspense } from "react";
import { SignedIn } from "~/auth";
import { cn } from "~/lib/cn";
import { toMonthParam } from "~/lib/temporal";
import { buttonVariants } from "~/ui/button";
import { Footer, Hero } from "./_components/content";
import { Waitlist } from "./_components/waitlist";
import * as Headless from "@headlessui/react";

export default function HomeLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  return (
    <>
      <div className="relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0">
        <BackgroundGradient />
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:before:flex-1 lg:flex-col lg:before:pt-6">
            <div className="pt-20 pb-16 lg:py-20 sm:pt-32 sm:pb-20">
              <div className="relative">
                <Hero>
                  <Waitlist />
                </Hero>
              </div>
            </div>
            <div className="flex flex-1 items-end justify-center pb-4 lg:justify-start lg:pb-6">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <Suspense>
        <SignedIn>
          <Headless.Transition
            appear
            show
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <Link
              className={cn(
                buttonVariants(),
                "absolute top-8 right-8 z-50 gap-2 text-sm lg:top-16 lg:right-16",
              )}
              href={`/report/${toMonthParam()}`}
            >
              Go to App
              <ArrowRightIcon className="size-4" />
            </Link>
          </Headless.Transition>
        </SignedIn>
      </Suspense>
      <div className="relative flex-auto">
        <main className="space-y-20 py-20 sm:space-y-32 dark:bg-gray-950 sm:py-32">
          {props.children}
        </main>
      </div>
    </>
  );
}
