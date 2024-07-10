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

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};

interface UseActionOptions<I, O> {
  initialValue?: O;
  permalink?: string;
  onError?: (error: unknown) => void | Promise<void>;
  onSuccess?: (result: O, variables: I) => void | Promise<void>;
}

export const useAction = <I, O>(
  action: (input: I) => Promise<O>,
  opts?: UseActionOptions<I, O>,
) => {
  const [state, dispatchAction, isPending] = React.useActionState(
    // @ts-expect-error - whatever
    async (state: O, input: I) => {
      let result: O = state;
      try {
        result = await action(input);
        await opts?.onSuccess?.(result, input);
      } catch (error) {
        await opts?.onError?.(error);
      }
      return result;
    },
    opts?.initialValue ?? null,
    opts?.permalink,
  );

  return {
    state,
    dispatch: dispatchAction,
    isPending,
  };
};
