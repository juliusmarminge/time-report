"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { cn } from "~/lib/cn";
import { buttonVariants } from "~/ui/button";
import { SheetClose } from "~/ui/sheet";

export function NavButton(props: {
  href: string;
  children: React.ReactNode;
  inSheet?: boolean;
}) {
  const pathname = usePathname();

  const Wrap = props.inSheet ? SheetClose : Fragment;

  return (
    <Wrap {...(props.inSheet ? { asChild: true } : {})}>
      <Link
        href={props.href}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group w-full justify-start text-popover-foreground dark:hover:bg-zinc-950 hover:bg-zinc-300",
          pathname === props.href && "bg-popover",
        )}
      >
        {props.children}
      </Link>
    </Wrap>
  );
}
