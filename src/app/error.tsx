"use client";

import { useEffect } from "react";

import { cn } from "~/lib/cn";
import { buttonVariants } from "~/ui/button";
import { Link } from "~/ui/link";
import { DashboardShell } from "./(app)/_components/shell";
import { Footer, Hero } from "./(home)/_components/content";
import { BackgroundGradient } from "./(home)/_components/gradient";

export default function ErrorPage(
  props: Readonly<{ error: Error; reset: () => void }>,
) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(props.error);
  }, [props.error]);

  return (
    <>
      <div className="relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0">
        <BackgroundGradient />
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:before:flex-1 lg:flex-col lg:before:pt-6">
            <div className="pt-20 pb-16 lg:py-20 sm:pt-32 sm:pb-20">
              <div className="relative">
                <Hero />
              </div>
            </div>
            <div className="flex flex-1 items-end justify-center pb-4 lg:justify-start lg:pb-6">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-auto">
        <main className="space-y-20 py-20 sm:space-y-32 dark:bg-gray-950 sm:py-32">
          <article className="scroll-mt-16 pb-0">
            <div>
              <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
                <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
                  <div className="mx-auto max-w-lg lg:mx-0 lg:flex-auto">
                    <DashboardShell title="Error">
                      <div className="flex items-center border border-dashed p-32">
                        <div className="flex flex-col gap-2 font-semibold text-lg">
                          Something went wrong...
                          <Link
                            href="/"
                            className={cn(
                              buttonVariants({ variant: "accent" }),
                              "shrink-0",
                            )}
                          >
                            Go back home
                          </Link>
                        </div>
                      </div>
                    </DashboardShell>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
