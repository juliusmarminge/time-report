import * as Headless from "@headlessui/react";
import NextLink, { type LinkProps } from "next/link";

export const Link = function Link(
  props: LinkProps & React.ComponentProps<"a">,
) {
  return (
    <Headless.DataInteractive>
      <NextLink {...props} ref={props.ref} />
    </Headless.DataInteractive>
  );
};
