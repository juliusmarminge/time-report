import { XMarkIcon } from "@heroicons/react/16/solid";
import { Slot } from "@radix-ui/react-slot";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import * as Headless from "@headlessui/react";
import { useIsDesktop } from "~/lib/utility-hooks";
import * as React from "react";
import { cn } from "~/lib/cn";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { NavbarItem } from "./navbar";

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

const SheetRoot = (
  props: Readonly<{
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>,
) => {
  const [open, onOpenChange] = useControllableState({
    prop: props.open,
    onChange: props.onOpenChange,
    defaultProp: false,
  });

  return (
    <SheetContext.Provider value={{ open: open ?? false, onOpenChange }}>
      {props.children}
    </SheetContext.Provider>
  );
};

const SheetContent = (
  props: Readonly<{
    children: React.ReactNode;
    className?: string;
  }>,
) => {
  const { open, onOpenChange } = React.use(SheetContext);
  return (
    <Headless.Transition appear show={open} {...props}>
      <Headless.Dialog onClose={() => onOpenChange(false)}>
        <Headless.TransitionChild
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/40" />
        </Headless.TransitionChild>

        <div className="fixed inset-0 w-screen overflow-y-auto pt-6 sm:pt-0">
          <Headless.TransitionChild
            enter="ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Headless.DialogPanel className="fixed inset-y-0 right-0 w-3/4 p-2 transition sm:max-w-md">
              <div className="flex h-full flex-col rounded-lg bg-background px-6 shadow-sm ring-1 ring-muted-foreground/10">
                <Headless.CloseButton
                  aria-label="Close Sheet"
                  as={NavbarItem}
                  className="absolute top-6 right-6"
                >
                  <XMarkIcon className="size-4" />
                </Headless.CloseButton>

                {props.children}
              </div>
            </Headless.DialogPanel>
          </Headless.TransitionChild>
        </div>
      </Headless.Dialog>
    </Headless.Transition>
  );
};

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { open, onOpenChange } = React.use(SheetContext);
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} onClick={() => onOpenChange(!open)} ref={ref} />;
});

const SheetHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      {...props}
      className={cn("flex flex-col border-b pt-6 pb-4", className)}
    />
  );
};

const SheetTitle = ({
  className,
  ...props
}: { className?: string } & Omit<Headless.DialogTitleProps, "className">) => {
  return (
    <Headless.DialogTitle
      {...props}
      className={cn(
        "text-balance font-semibold text-lg/6 text-zinc-950 dark:text-white sm:text-base/6",
        className,
      )}
    />
  );
};

const SheetDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-1 flex-col overflow-y-auto text-muted-foreground text-sm",
        className,
      )}
    />
  );
};

const SheetBody = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  return <div {...props} className={cn("mt-4", className)} />;
};

/**
 * Use Drawer from Vaul on mobile, HeadlessUI Sheet on Desktop
 */
export const useResponsiveSheet = () => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return {
      Root: SheetRoot,
      Trigger: SheetTrigger,
      Content: SheetContent,
      Header: SheetHeader,
      Title: SheetTitle,
      Description: SheetDescription,
      Body: SheetBody,
    };
  }

  return {
    Root: Drawer,
    Trigger: DrawerTrigger,
    Content: DrawerContent,
    Header: DrawerHeader,
    Title: DrawerTitle,
    Description: DrawerDescription,
    Body: SheetBody,
  };
};
