"use client";

import React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/cn";
import { Avatar, AvatarFallback } from "~/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

export function SettingsMenu(props: { className?: string }) {
  //   const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center justify-between gap-2 px-6 py-3 hover:cursor-pointer hover:bg-accent-foreground hover:text-accent",
          props.className,
        )}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {/* {user.imageUrl ? (
              <AvatarImage
                src={user.imageUrl}
                alt={user.username ?? "Profile picture"}
              />
            ) : null} */}
            <AvatarFallback className="flex h-8 w-8">
              {/* {(user?.fullName ?? "U").slice(0, 2).toUpperCase()} */}
              JD
            </AvatarFallback>
          </Avatar>

          <span className="text-sm font-semibold">John Doe</span>
        </div>
        <ChevronRightIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            {/* <GearIcon className="mr-2 h-4 w-4" /> */}
            <span className="mr-2 text-lg">$</span>
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuGroup>
          <SignOutButton signOutCallback={() => router.push("/auth/sign-in")}>
            <DropdownMenuItem asChild className="cursor-pointer">
              <span>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </span>
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuGroup> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
