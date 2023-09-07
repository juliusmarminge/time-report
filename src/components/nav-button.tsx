"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/cn";
import { Button } from "~/ui/button";
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
      <Button
        variant="ghost"
        className={cn(
          "group w-full justify-start text-popover-foreground hover:bg-zinc-300 dark:hover:bg-zinc-950",
          pathname === props.href && "bg-popover",
        )}
        asChild
      >
        <Link href={props.href}>{props.children}</Link>
      </Button>
    </Wrap>
  );
}
