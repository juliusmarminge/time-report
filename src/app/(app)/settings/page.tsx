import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { DashboardShell } from "../_components/shell";
import { currentUser } from "~/auth";
import { SelectCurrency } from "./_components/select-currency";
import { ThemeToggle } from "./_components/select-theme";

export default async function SettingsPage() {
  const user = await currentUser({ redirect: true });

  return (
    <DashboardShell
      title="Settings"
      description="Manage your settings."
      className="gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Change the appearance of the app.</CardDescription>
        </CardHeader>
        <CardFooter>
          <ThemeToggle />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Currency</CardTitle>
          <CardDescription>
            Select your preferred currency. Aggregations and other calculations
            will be converted to this currency.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <SelectCurrency currency={user.defaultCurrency} />
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
