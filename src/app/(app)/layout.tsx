import { currentUser } from "~/lib/auth";
import { ConverterProvider } from "~/lib/converter";
import { getCurrencyRates } from "~/lib/currencies";

export default function DynamicLayout(props: { children: React.ReactNode }) {
  return (
    <ConverterProvider user={currentUser()} rates={getCurrencyRates()}>
      {props.children}
    </ConverterProvider>
  );
}
