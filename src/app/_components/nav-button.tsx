"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { cn } from "~/lib/cn";
import { buttonVariants } from "~/ui/button";
import { SheetClose } from "~/ui/sheet";

type StartsWithMatcher = `starts-with-${string}`;

export function NavButton(props: {
  href: string;
  activeMatcher?: "exact" | StartsWithMatcher;
  children: React.ReactNode;
  inSheet?: boolean;
}) {
  const pathname = usePathname();
  const isActive = (() => {
    const matcher = props.activeMatcher ?? "exact";
    if (matcher === "exact") {
      return pathname === props.href;
    }

    const startsWith = matcher.slice("starts-with-".length);
    return pathname.startsWith(startsWith);
  })();

  const Wrap = props.inSheet ? SheetClose : Fragment;

  return (
    <Wrap {...(props.inSheet ? { asChild: true } : {})}>
      <Link
        href={props.href}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group w-full justify-start text-popover-foreground dark:hover:bg-zinc-950 hover:bg-zinc-300",
          isActive && "bg-popover",
        )}
      >
        {props.children}
      </Link>
    </Wrap>
  );
}
