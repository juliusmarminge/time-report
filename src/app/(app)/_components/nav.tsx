"use client";

import * as Headless from "@headlessui/react";
import * as React from "react";

import { Avatar } from "~/ui/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "~/ui/dropdown-menu";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "~/ui/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "~/ui/sidebar";

import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";
import {
  Bars2Icon,
  CalendarDaysIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { isPast, toMonthParam } from "~/lib/temporal";
import { LogoIcon } from "~/ui/icons";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { Temporal } from "@js-temporal/polyfill";
import { Badge } from "~/ui/badge";
import { closePeriodSheetOpen } from "~/lib/atoms";
import { useSetAtom } from "jotai";
import { cn } from "~/lib/cn";
import { trpc } from "~/trpc/client";
import type { RouterInputs } from "~/trpc/router";

function MobileSidebar(
  props: Readonly<{
    open: boolean;
    close: () => void;
    children: React.ReactNode;
  }>,
) {
  return (
    <Headless.Transition show={props.open}>
      <Headless.Dialog onClose={props.close} className="lg:hidden">
        <Headless.TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/40" />
        </Headless.TransitionChild>
        <Headless.TransitionChild
          enter="ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Headless.DialogPanel className="fixed inset-y-0 w-full max-w-80 p-2 transition">
            <div className="flex h-full flex-col rounded-lg bg-background shadow-sm ring-1 ring-muted-foreground/10">
              <div className="-mb-3 px-4 pt-3">
                <Headless.CloseButton
                  as={NavbarItem}
                  aria-label="Close navigation"
                >
                  <XMarkIcon />
                </Headless.CloseButton>
              </div>
              {props.children}
            </div>
          </Headless.DialogPanel>
        </Headless.TransitionChild>
      </Headless.Dialog>
    </Headless.Transition>
  );
}

function UserButton(
  props: Readonly<{
    userPromise: Promise<Session["user"]>;
  }>,
) {
  const user = React.use(props.userPromise);

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>
        <span className="flex min-w-0 items-center lg:gap-3">
          <Avatar
            src={user?.image}
            initials={(user.name ?? "U").slice(0, 2).toUpperCase()}
            className="size-6 lg:size-10"
            square
          />
          <span className="min-w-0 max-lg:hidden">
            <span className="block truncate font-medium text-sm/5">
              {user.name ?? "U"}
            </span>
            <span className="block truncate font-normal text-muted-foreground text-xs/5">
              {user.email}
            </span>
          </span>
        </span>
        <ChevronUpIcon className="max-lg:hidden" />
      </DropdownButton>
      <DropdownMenu className="min-w-64" anchor="top start">
        <DropdownItem href="/settings">
          <Cog8ToothIcon />
          <DropdownLabel>Settings</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/profile">
          <UserCircleIcon />
          <DropdownLabel>Profile</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => signOut()}>
          <ArrowRightStartOnRectangleIcon />
          <DropdownLabel>Sign out</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export function MySidebar(
  props: Readonly<{
    userPromise: Promise<Session["user"]>;
  }>,
) {
  const pn = usePathname();
  const setClosePeriodSheetOpen = useSetAtom(closePeriodSheetOpen);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem disabled>
          <LogoIcon className="size-8" />
          <SidebarLabel className="font-cal text-3xl tracking-tight">
            Time Report
          </SidebarLabel>
        </SidebarItem>
        <SidebarSection className="max-lg:hidden">
          <SidebarItem href="/search" disabled current={pn === "/search"}>
            <MagnifyingGlassIcon />
            <SidebarLabel>Search</SidebarLabel>
          </SidebarItem>

          <SidebarItem onClick={() => setClosePeriodSheetOpen(true)}>
            <InboxIcon />
            <SidebarLabel>Inbox</SidebarLabel>
            <React.Suspense fallback={null}>
              <InboxCount />
            </React.Suspense>
          </SidebarItem>
        </SidebarSection>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem
            href={`/report/${toMonthParam()}`}
            current={pn.startsWith("/report")}
          >
            <CalendarDaysIcon />
            <SidebarLabel>Report Time</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/clients" current={pn === "/clients"}>
            <UsersIcon />
            <SidebarLabel>Clients</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Ongoing Periods</SidebarHeading>
          <React.Suspense
            fallback={
              <SidebarItem disabled className="text-muted-foreground text-sm">
                Loading Open Periods...
              </SidebarItem>
            }
          >
            <PeriodItems filter="open" />
          </React.Suspense>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Recently Closed Periods</SidebarHeading>
          <React.Suspense
            fallback={
              <SidebarItem disabled className="text-muted-foreground text-sm">
                Loading Recent Periods...
              </SidebarItem>
            }
          >
            <PeriodItems filter="recently-closed" />
          </React.Suspense>
        </SidebarSection>
        <SidebarSpacer />
      </SidebarBody>
      <SidebarFooter className="max-lg:hidden">
        <UserButton userPromise={props.userPromise} />
      </SidebarFooter>
    </Sidebar>
  );
}

function InboxCount(
  props: Readonly<{
    className?: string;
  }>,
) {
  const [periods] = trpc.listPeriods.useSuspenseQuery({ filter: "open" });
  const expired = periods.filter((p) => isPast(p.endDate)).length;

  if (expired === 0) return null;

  return (
    <Badge
      data-slot="icon"
      className={cn("justify-center p-0.5", props.className)}
    >
      {expired}
    </Badge>
  );
}

function PeriodItems(
  props: Readonly<{
    filter: RouterInputs["listPeriods"]["filter"];
  }>,
) {
  const [periods] = trpc.listPeriods.useSuspenseQuery({ filter: props.filter });
  const pn = usePathname();

  return periods
    .sort((a, b) => Temporal.PlainDate.compare(b.endDate, a.endDate))
    .map((p) => (
      <SidebarItem
        key={p.id}
        href={`/periods/${p.id}`}
        current={pn === `/periods/${p.id}`}
        className="capitalize"
      >
        <span>
          {p.client.name} -{" "}
          {p.endDate.toLocaleString(undefined, {
            month: "short",
            year: "2-digit",
          })}
        </span>
        {isPast(p.endDate) && p.status === "open" && (
          <ExclamationCircleIcon className="ml-1" />
        )}
      </SidebarItem>
    ));
}

export function MyNavbar(
  props: Readonly<{
    userPromise: Promise<Session["user"]>;
  }>,
) {
  const setClosePeriodSheetOpen = useSetAtom(closePeriodSheetOpen);
  return (
    <Navbar>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search" disabled>
          <MagnifyingGlassIcon />
        </NavbarItem>
        <NavbarItem
          className="relative"
          aria-label="Inbox"
          onClick={() => setClosePeriodSheetOpen(true)}
        >
          <InboxIcon />
          <React.Suspense fallback={null}>
            <InboxCount className="absolute top-0 right-0" />
          </React.Suspense>
        </NavbarItem>
      </NavbarSection>
      <UserButton userPromise={props.userPromise} />
    </Navbar>
  );
}

export const MobileControlledNavigation = (
  props: Readonly<{
    userPromise: Promise<Session["user"]>;
  }>,
) => {
  const [showSidebar, setShowSidebar] = React.useState(false);

  return (
    <>
      <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
        <MySidebar userPromise={props.userPromise} />
      </MobileSidebar>

      <header className="flex items-center px-4 lg:hidden">
        <div className="py-2.5">
          <NavbarItem
            onClick={() => setShowSidebar(true)}
            aria-label="Open navigation"
          >
            <Bars2Icon />
          </NavbarItem>
        </div>
        <div className="min-w-0 flex-1">
          <MyNavbar userPromise={props.userPromise} />
        </div>
      </header>
    </>
  );
};
