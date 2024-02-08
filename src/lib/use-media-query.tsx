import * as React from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
