import * as React from "react";

import { cn } from "~/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

type InputFieldProps = {
  className?: string;
} & (
  | {
      /** append a dropdown/select before the input */
      leading: React.ReactNode;
      trailing?: never;
    }
  | {
      /** append a dropdown/select after the input */
      trailing: React.ReactNode;
      leading?: never;
    }
);

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, leading, trailing, ...props }, ref) => {
    return (
      <div className="group relative mb-1 flex items-center rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-ring">
        {leading && <Addon className="rounded-l-md">{leading}</Addon>}

        <Input
          ref={ref}
          type="text"
          className={cn(
            "focus-visible:ring-0",
            leading && "rounded-l-none border-l-0",
            trailing && "rounded-r-none border-r-0",
            className,
          )}
          {...props}
          {...props}
        />

        {trailing && <Addon className="rounded-r-md">{trailing}</Addon>}
      </div>
    );
  },
);
InputField.displayName = "InputField";

export { Input, InputField };

interface AddonProps {
  children: React.ReactNode;
  isFilled?: boolean;
  className?: string;
  error?: boolean;
  onClickAddon?: () => void;
}

const Addon = ({
  isFilled,
  children,
  className,
  error,
  onClickAddon,
}: AddonProps) => (
  <div
    onClick={onClickAddon && onClickAddon}
    className={cn(
      "addon-wrapper [&:has(+_input:hover)]:border-emphasis [&:has(+_input:hover)]:border-r-default h-9 overflow-hidden border [input:hover_+_&]:border [input:hover_+_&]:border-l",
      isFilled && "bg-muted",
      onClickAddon && "cursor-pointer disabled:hover:cursor-not-allowed",
      className,
    )}
  >
    <div
      className={cn(
        "flex min-h-9 flex-col justify-center text-sm leading-7",
        error ? "text-error" : "text-default",
      )}
    >
      <span className="flex whitespace-nowrap">{children}</span>
    </div>
  </div>
);
