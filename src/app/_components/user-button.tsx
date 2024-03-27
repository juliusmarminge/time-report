"use client";

import { useTheme } from "@juliusmarminge/next-themes";
import { ChevronRightIcon, ExitIcon, Half2Icon } from "@radix-ui/react-icons";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { use } from "react";

import { cn } from "~/lib/cn";
import { setDefaultCurrency } from "~/lib/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button, buttonVariants } from "~/ui/button";
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

export function UserButton(props: {
  className?: string;
  user: Promise<Session["user"] | null>;
}) {
  const user = use(props.user);
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          buttonVariants(),
          "justify-start gap-2 bg-popover py-6 text-popover-foreground dark:hover:bg-zinc-950 hover:bg-zinc-300",
          props.className,
        )}
      >
        <span className="font-semibold text-sm">Sign in to get started</span>
        <ChevronRightIcon className="ml-auto h-4 w-4" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "justify-start gap-2 bg-popover py-6 text-popover-foreground dark:hover:bg-zinc-950 hover:bg-zinc-300",
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
          <span className="font-semibold text-sm">{user.name}</span>
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
              {(["USD", "EUR", "GBP", "SEK"] as const).map((currency) => (
                <DropdownMenuItem
                  key={currency}
                  className="cursor-pointer"
                  onClick={async () => {
                    await setDefaultCurrency(currency);
                  }}
                >
                  {currency}
                  <span
                    className={cn(
                      "ml-auto font-bold opacity-0",
                      user?.defaultCurrency === currency && "opacity-100",
                    )}
                  >
                    ⋅
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Half2Icon className="mr-2 size-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {["dark", "light", "system"].map((t) => (
                <DropdownMenuItem
                  className="cursor-pointer capitalize"
                  onClick={() => setTheme(t)}
                >
                  {t}
                  <span
                    className={cn(
                      "ml-auto font-bold opacity-0",
                      t === theme && "opacity-100",
                    )}
                  >
                    ⋅
                  </span>
                </DropdownMenuItem>
              ))}
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
