import { redirect } from "next/navigation";

import { DashboardShell } from "~/app/(app)/_components/shell";
import { currentUser } from "~/auth";
import { trpc } from "~/trpc/server";
import { ClientList } from "./_components/client-card";
import { NewClientSheet } from "./_components/new-client-form";

export default async function ClientsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  void trpc.listClients.prefetch();

  return (
    <DashboardShell
      title="Clients"
      description="Browse and manage your clients."
      className="gap-4"
      headerActions={<NewClientSheet trigger="icon" />}
    >
      <ClientList />
    </DashboardShell>
  );
}
