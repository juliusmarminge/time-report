"use client";

import { ChevronRightIcon, ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

import type { Session } from "~/lib/auth";
import { cn } from "~/lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

export function SettingsMenu(props: {
  className?: string;
  user: Session["user"] | null;
}) {
  const { user } = props;

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
            {user?.image && (
              <AvatarImage
                src={user.image}
                alt={user.name ?? "Profile picture"}
              />
            )}
            <AvatarFallback className="flex h-8 w-8">
              {(user?.name ?? "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">
            {user?.name ?? "Sign in to get started"}
          </span>
        </div>
        <ChevronRightIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <span className="mr-2 text-lg">$</span>
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => signOut()}
          >
            <ExitIcon className="mr-2 h-4 w-4" />
            Sign out
            {/* <CSRF_experimental /> */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
