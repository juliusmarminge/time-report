import { HamburgerMenuIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/cn";
import { Button } from "~/ui/button";

export function MobileNav(props: { className?: string }) {
  return (
    <nav
      className={cn(
        "flex w-full items-center justify-between p-4",
        props.className,
      )}
    >
      <Button variant="ghost" size="icon">
        <HamburgerMenuIcon className="h-6 w-6" />
      </Button>
    </nav>
  );
}
