import type { MDXComponents } from "mdx/types";

import * as mdxComponents from "~/ui/mdx";
import { Link } from "~/ui/link";

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    ...mdxComponents,
    a: Link,
  };
}
