"use client";

import * as Headless from "@headlessui/react";
import clsx from "clsx";
import { LayoutGroup, motion } from "framer-motion";
import React, { useId } from "react";
import { cn } from "~/lib/cn";
import { TouchTarget } from "~/ui/button";
import { Link } from "~/ui/link";

export function Navbar({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      {...props}
      className={cn("flex flex-1 items-center gap-3 py-2.5", className)}
    />
  );
}

export function NavbarSection({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const id = useId();

  return (
    <LayoutGroup id={id}>
      <div {...props} className={cn("flex items-center gap-3", className)} />
    </LayoutGroup>
  );
}

export function NavbarSpacer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn("-ml-4 flex-1", className)}
    />
  );
}

export const NavbarItem = React.forwardRef(function NavbarItem(
  {
    current,
    className,
    children,
    ...props
  }: { current?: boolean; className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, "className">
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, "className">
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
) {
  const classes = cn(
    // Base
    "relative flex min-w-0 items-center gap-3 rounded-lg p-2 text-left font-medium text-base/6 sm:text-sm/5",
    // Leading icon/icon-only
    "data-[slot=icon]:*:size-6 sm:data-[slot=icon]:*:size-5 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:fill-muted-foreground",
    // Trailing icon (down chevron or similar)
    "data-[slot=icon]:last:[&:not(:nth-child(2))]:*:ml-auto data-[slot=icon]:last:[&:not(:nth-child(2))]:*:size-5 sm:data-[slot=icon]:last:[&:not(:nth-child(2))]:*:size-4",
    // Avatar
    "data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 sm:data-[slot=avatar]:*:size-6 data-[slot=avatar]:*:[--avatar-radius:theme(borderRadius.DEFAULT)] data-[slot=avatar]:*:[--ring-opacity:10%]",
    // Hover
    "data-[hover]:bg-foreground/5 data-[slot=icon]:*:data-[hover]:fill-foreground",
    // Active
    "data-[active]:bg-foreground/5 data-[slot=icon]:*:data-[active]:fill-foreground",
  );

  return (
    <span className={cn("relative", className)}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="-bottom-2.5 absolute inset-x-2 h-0.5 rounded-full bg-foreground"
        />
      )}
      {"href" in props ? (
        <Link
          {...props}
          className={cn(classes)}
          data-current={current ? "true" : undefined}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          <TouchTarget>{children}</TouchTarget>
        </Link>
      ) : (
        <Headless.Button
          {...props}
          className={cn("cursor-default", classes)}
          data-current={current ? "true" : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.Button>
      )}
    </span>
  );
});
