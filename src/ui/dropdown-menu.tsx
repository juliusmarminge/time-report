"use client";

import * as Headless from "@headlessui/react";

import type React from "react";
import { useId } from "react";
import { cn } from "~/lib/cn";
import { Button } from "./button";
import { Link } from "./link";

export function Dropdown(props: Headless.MenuProps) {
  return <Headless.Menu {...props} />;
}

export function DropdownButton<T extends React.ElementType = typeof Button>({
  as = Button,
  ...props
}: { className?: string } & Omit<Headless.MenuButtonProps<T>, "className">) {
  return <Headless.MenuButton as={as} {...props} />;
}

export function DropdownMenu({
  anchor = "bottom",
  className,
  ...props
}: { className?: string } & Omit<Headless.MenuItemsProps, "className">) {
  return (
    <Headless.Transition leave="duration-100 ease-in" leaveTo="opacity-0">
      <Headless.MenuItems
        {...props}
        anchor={anchor}
        className={cn(
          // Base
          "isolate w-max overflow-y-auto rounded-xl bg-popover p-1 shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl dark:ring-inset",
          // Positioning
          "[--anchor-gap:theme(spacing.2)] [--anchor-padding:theme(spacing.1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px] sm:data-[anchor~=end]:[--anchor-offset:4px] sm:data-[anchor~=start]:[--anchor-offset:-4px]",
          className,
        )}
      />
    </Headless.Transition>
  );
}

export function DropdownItem({
  className,
  ...props
}: { className?: string } & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, "className">
  | Omit<React.ComponentPropsWithoutRef<"button">, "className">
)) {
  const classes = cn(
    // Base styles
    "group w-full cursor-default rounded-lg px-3.5 py-2.5 text-left text-base/6 data-[focus]:bg-primary sm:px-3 sm:py-1.5 data-[focus]:text-primary-foreground sm:text-sm/6 data-[disabled]:opacity-50 focus:outline-none",
    // Layout
    "col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center",
    // Icons
    "[&>[data-slot=icon]]:-ml-0.5 [&>[data-slot=icon]]:col-start-1 [&>[data-slot=icon]]:row-start-1 [&>[data-slot=icon]]:mr-2.5 sm:[&>[data-slot=icon]]:mr-2 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:sm:size-4",
    "[&>[data-slot=icon]]:dark:text-muted-foreground [&>[data-slot=icon]]:data-[focus]:text-background",
    // Avatar
    "[&>[data-slot=avatar]]:-ml-1 [&>[data-slot=avatar]]:mr-2.5 sm:[&>[data-slot=avatar]]:mr-2 [&>[data-slot=avatar]]:size-6 sm:[&>[data-slot=avatar]]:size-5",
    className,
  );

  return (
    <Headless.MenuItem>
      {"href" in props ? (
        <Link {...props} className={classes} />
      ) : (
        <button {...props} className={classes} />
      )}
    </Headless.MenuItem>
  );
}

export function DropdownHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={cn("col-span-5 px-3.5 pt-2.5 pb-1 sm:px-3", className)}
    />
  );
}

export function DropdownSection({
  className,
  ...props
}: { className?: string } & Omit<Headless.MenuSectionProps, "className">) {
  return (
    <Headless.MenuSection
      {...props}
      className={cn("col-span-full", className)}
    />
  );
}

export function DropdownHeading({
  className,
  ...props
}: { className?: string } & Omit<Headless.MenuHeadingProps, "className">) {
  return (
    <Headless.MenuHeading
      {...props}
      className={cn(
        "col-span-full grid grid-cols-[1fr,auto] gap-x-12 px-3.5 pt-2 pb-1 font-cal font-medium text-muted-foreground text-sm/5 sm:px-3 sm:text-xs/5",
        className,
      )}
    />
  );
}

export function DropdownDivider({
  className,
  ...props
}: { className?: string } & Omit<Headless.MenuSeparatorProps, "className">) {
  return (
    <Headless.MenuSeparator
      {...props}
      className={cn(
        "col-span-full mx-3.5 my-1 h-px border-0 bg-zinc-950/5 sm:mx-3 dark:bg-white/10",
        className,
      )}
    />
  );
}

export function DropdownLabel({
  className,
  ...props
}: { className?: string } & Omit<Headless.LabelProps, "className">) {
  return (
    <Headless.Label
      {...props}
      data-slot="label"
      className={cn("col-start-2 row-start-1", className)}
      {...props}
    />
  );
}

export function DropdownDescription({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps, "className">) {
  return (
    <Headless.Description
      data-slot="description"
      {...props}
      className={cn(
        "col-span-2 col-start-2 row-start-2 text-sm/5 text-zinc-500 dark:text-zinc-400 group-data-[focus]:text-white sm:text-xs/5",
        className,
      )}
    />
  );
}

export function DropdownShortcut({
  keys,
  className,
  ...props
}: { keys: string | string[]; className?: string } & Omit<
  Headless.DescriptionProps<"kbd">,
  "className"
>) {
  const id = useId();
  return (
    <Headless.Description
      as="kbd"
      {...props}
      className={cn("col-start-5 row-start-1 flex justify-self-end", className)}
    >
      {(Array.isArray(keys) ? keys : keys.split("")).map((char, index) => (
        <kbd
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={`${id}-${index}`}
          className={cn(
            "min-w-[2ch] text-center font-sans text-zinc-400 capitalize group-data-[focus]:text-white",
            // Make sure key names that are longer than one character (like "Tab") have extra space
            index > 0 && char.length > 1 && "pl-1",
          )}
        >
          {char}
        </kbd>
      ))}
    </Headless.Description>
  );
}
