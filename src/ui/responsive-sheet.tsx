import { useIsDesktop } from "~/lib/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

export const useResponsiveSheet = () => {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return {
      Root: Sheet,
      Trigger: SheetTrigger,
      Content: SheetContent,
      Header: SheetHeader,
      Title: SheetTitle,
      Description: SheetDescription,
    };
  }

  return {
    Root: Drawer,
    Trigger: DrawerTrigger,
    Content: DrawerContent,
    Header: DrawerHeader,
    Title: DrawerTitle,
    Description: DrawerDescription,
  };
};
