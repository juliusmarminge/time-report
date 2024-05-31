import type { MDXComponents } from "mdx/types";

import { Link } from "~/ui/link";
import * as mdxComponents from "~/ui/mdx";

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    ...mdxComponents,
    a: Link,
  };
}
