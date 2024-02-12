import { currentUser } from "~/auth/rsc";
import { ConverterProvider } from "~/monetary/context";
import { getCurrencyRates } from "~/monetary/rsc";
import { TRPCReactProvider } from "~/trpc/react";

/**
 * FIXME: This indirection shouldn't be needed.
 * We should be able to pass these as promises and still have stuff statically prerendered.
 */
export default function DynamicLayout(props: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ConverterProvider user={currentUser()} rates={getCurrencyRates()}>
        {props.children}
      </ConverterProvider>
    </TRPCReactProvider>
  );
}
