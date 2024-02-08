import { currentUser } from "~/auth/rsc";
import { ConverterProvider } from "~/lib/converter";
import { getCurrencyRates } from "~/lib/monetary.server";

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
