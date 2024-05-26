import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/lib/cn";

const badgeVariants = cva(
  "inline-flex cursor-default items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        "trend-bad":
          "border-transparent bg-rose-500/20 text-red-600 shadow dark:bg-rose-500/20",
        "trend-good":
          "dark:green-400/20 border-transparent bg-green-400/20 text-green-500 shadow",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

type TrendBadgeProps = BadgeProps & {
  value: string;
};
function TrendBadge({ className, value, ...props }: TrendBadgeProps) {
  const variant = value.startsWith("-") ? "trend-bad" : "trend-good";
  return (
    <Badge className={className} variant={variant} {...props}>
      {value}
    </Badge>
  );
}

export { Badge, badgeVariants, TrendBadge };
