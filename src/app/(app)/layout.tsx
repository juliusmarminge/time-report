import { currentUser } from "~/auth";
import { ConverterProvider } from "~/monetary/context";
import { getCurrencyRates } from "~/monetary/rsc";

/**
 * FIXME: This indirection shouldn't be needed.
 * We should be able to pass these as promises and still have stuff statically prerendered.
 */
export default function DynamicLayout(props: { children: React.ReactNode }) {
  return (
    <ConverterProvider user={currentUser()} rates={getCurrencyRates()}>
      {props.children}
    </ConverterProvider>
  );
}
