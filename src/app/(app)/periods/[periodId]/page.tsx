import { DashboardShell } from "../../_components/shell";

export default function PeriodsDetailsPage(props: {
  params: { periodId: string };
}) {
  return (
    <DashboardShell title="Period" description={props.params.periodId}>
      Coming Soon...
    </DashboardShell>
  );
}
