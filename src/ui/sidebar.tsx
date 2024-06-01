"use client";

import * as Headless from "@headlessui/react";

import { LayoutGroup, motion } from "framer-motion";
import * as React from "react";
import { cn } from "~/lib/cn";
import { TouchTarget } from "~/ui/button";
import { Link } from "~/ui/link";

export function Sidebar({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"nav">) {
  return <nav {...props} className={cn("flex h-full flex-col", className)} />;
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col border-b p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
        className,
      )}
    />
  );
}

export function SidebarBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8",
        className,
      )}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col border-t p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
        className,
      )}
    />
  );
}

export function SidebarSection({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const id = React.useId();

  return (
    <LayoutGroup id={id}>
      <div
        {...props}
        data-slot="section"
        className={cn("flex flex-col gap-0.5", className)}
      />
    </LayoutGroup>
  );
}

export function SidebarDivider({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"hr">) {
  return <hr {...props} className={cn("lg:-mx-4 my-4 border-t", className)} />;
}

export function SidebarSpacer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn("mt-8 flex-1", className)}
    />
  );
}

export function SidebarHeading({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      {...props}
      className={cn(
        "mb-1 px-2 font-cal font-medium text-muted-foreground text-xs/6",
        className,
      )}
    />
  );
}

export const SidebarItem = React.forwardRef(function SidebarItem(
  {
    current,
    className,
    children,
    ...props
  }: {
    current?: boolean;
    className?: string;
    children: React.ReactNode;
  } & (
    | Omit<Headless.ButtonProps, "className">
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, "type" | "className">
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
) {
  const classes = cn(
    // Base
    "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left font-medium text-base/6 sm:py-2 sm:text-sm/5",
    // Leading icon/icon-only
    "data-[slot=icon]:*:size-6 sm:data-[slot=icon]:*:size-5 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:fill-zinc-500",
    // Trailing icon (down chevron or similar)
    "data-[slot=icon]:last:*:ml-auto data-[slot=icon]:last:*:size-5 sm:data-[slot=icon]:last:*:size-4",
    // Avatar
    "data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 sm:data-[slot=avatar]:*:size-6 data-[slot=avatar]:*:[--ring-opacity:10%]",
    // Hover
    "data-[hover]:bg-foreground/5 data-[slot=icon]:*:data-[hover]:fill-foreground",
    // Active
    "data-[active]:bg-foreground/5 data-[slot=icon]:*:data-[active]:fill-foreground",
    // Current
    "data-[slot=icon]:*:data-[current]:fill-foreground",
  );

  return (
    <span className={cn("relative", className)}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="-left-4 absolute inset-y-2 w-0.5 rounded-full bg-foreground"
        />
      )}
      {"href" in props ? (
        <Headless.CloseButton as={React.Fragment} ref={ref}>
          <Link
            className={cn(classes)}
            {...props}
            data-current={current ? "true" : undefined}
          >
            <TouchTarget>{children}</TouchTarget>
          </Link>
        </Headless.CloseButton>
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

export function SidebarLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return <span {...props} className={cn("truncate", className)} />;
}
