import Link from "next/link";

import { NavButton } from "~/components/nav-button";
import { currentUser } from "~/lib/auth";
import { cn } from "~/lib/cn";
import { SettingsMenu } from "./settings-menu";

export async function DesktopSidebar(props: { className?: string }) {
  const user = await currentUser();

  return (
    <aside
      className={cn(
        "fixed h-screen pb-12 lg:inset-y-0 lg:flex lg:w-72 lg:flex-col",
        props.className,
      )}
    >
      <Link
        href="/"
        className="flex cursor-pointer items-center stroke-stone-800 px-8 py-6 text-2xl font-semibold tracking-tight duration-200 hover:stroke-stone-700 hover:text-stone-700 dark:stroke-stone-500 dark:text-stone-200 dark:hover:stroke-white dark:hover:text-white"
      >
        <span className="bg-gradient-to-tr from-gray-800 to-gray-500 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
          Time
        </span>
        <span>Report</span>
      </Link>

      <div className="flex flex-col gap-4 p-4">
        <NavButton href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-6 w-6"
          >
            <path
              className="fill-muted-foreground"
              d="M3 11h2a1 1 0 0 1 0 2H3v-2zm3.34-6.07l1.42 1.41a1 1 0 0 1-1.42 1.42L4.93 6.34l1.41-1.41zM13 3v2a1 1 0 0 1-2 0V3h2zm6.07 3.34l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41 1.41 1.41zM21 13h-2a1 1 0 0 1 0-2h2v2z"
            />
            <path
              className="fill-foreground"
              d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-6.93-6h13.86a8 8 0 1 0-13.86 0z"
            />
            <path
              className="fill-foreground"
              d="M11 14.27V9a1 1 0 0 1 2 0v5.27a2 2 0 1 1-2 0z"
            />
          </svg>
          Overview
        </NavButton>
        <NavButton href="/clients">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-6 w-6"
          >
            <path
              className="fill-muted-foreground"
              d="M12 13a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1 1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3zM7 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm10 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
            />
            <path
              className="fill-foreground"
              d="M12 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm-3 1h6a3 3 0 0 1 3 3v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a3 3 0 0 1 3-3z"
            />
          </svg>
          Clients
        </NavButton>
      </div>

      <SettingsMenu className="mx-4 mt-auto" user={user} />
    </aside>
  );
}