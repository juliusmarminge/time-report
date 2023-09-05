"use client";

import { ChevronRightIcon, ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

import type { Session } from "~/lib/auth";
import { cn } from "~/lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button } from "~/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

export function SettingsMenu(props: {
  className?: string;
  user: Session["user"] | null;
}) {
  const { user } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "justify-start gap-2 bg-popover py-6 text-popover-foreground hover:bg-popover/40",
            props.className,
          )}
        >
          <Avatar className="h-8 w-8 rounded-sm">
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
          <ChevronRightIcon className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="mr-2 text-lg">$</span>
              <span>Currency</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="cursor-pointer">
                USD
                <span className="ml-auto font-bold">⋅</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                EUR
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                GBP
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                SEK
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
