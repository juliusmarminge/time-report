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
import { toMonthParam } from "~/lib/temporal";
import { Logo } from "~/ui/logo";

function MobileSidebar({
  open,
  close,
  children,
}: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
  return (
    <Headless.Transition show={open}>
      <Headless.Dialog onClose={close} className="lg:hidden">
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
              {children}
            </div>
          </Headless.DialogPanel>
        </Headless.TransitionChild>
      </Headless.Dialog>
    </Headless.Transition>
  );
}

function UserButton(props: {
  userPromise: Promise<Session["user"]>;
}) {
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
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem disabled>
          <Logo className="size-8" />
          <SidebarLabel className="font-cal text-3xl tracking-tight">
            Time Report
          </SidebarLabel>
        </SidebarItem>
        <SidebarSection className="max-lg:hidden">
          <SidebarItem href="/search" disabled current={pn === "/search"}>
            <MagnifyingGlassIcon />
            <SidebarLabel>Search</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/inbox" disabled>
            <InboxIcon />
            <SidebarLabel>Inbox</SidebarLabel>
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
        <SidebarSection className="max-lg:hidden">
          <SidebarHeading>Ongoing Periods</SidebarHeading>
          <SidebarItem>T3 Tools - May 24</SidebarItem>
        </SidebarSection>
        <SidebarSpacer />
      </SidebarBody>
      <SidebarFooter className="max-lg:hidden">
        <UserButton userPromise={props.userPromise} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function MyNavbar(props: {
  userPromise: Promise<Session["user"]>;
}) {
  return (
    <Navbar>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem href="/search" aria-label="Search" disabled>
          <MagnifyingGlassIcon />
        </NavbarItem>
        <NavbarItem href="/inbox" aria-label="Inbox" disabled>
          <InboxIcon />
        </NavbarItem>
      </NavbarSection>
      <UserButton userPromise={props.userPromise} />
    </Navbar>
  );
}

export const MobileControlledNavigation = (props: {
  userPromise: Promise<Session["user"]>;
}) => {
  const [showSidebar, setShowSidebar] = React.useState(false);

  React.useEffect(() => {
    const listener = (e: TouchEvent) => {
      console.log("touch", e);
    };
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  return (
    <>
      <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
        <MySidebar userPromise={props.userPromise} />
      </MobileSidebar>

      <header className="flex items-center px-4 lg:hidden">
        <div className="py-2.5">
          <NavbarItem
            onClick={() => {
              console.log("Press");
              setShowSidebar(true);
            }}
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
