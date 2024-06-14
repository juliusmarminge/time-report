import { redirect } from "next/navigation";

import { DashboardShell } from "~/app/(app)/_components/shell";
import { currentUser } from "~/auth";
import { tson } from "~/lib/tson";
import { trpc } from "~/trpc/server";
import { ClientCard } from "./_components/client-card";
import { NewClientSheet } from "./_components/new-client-form";

export default async function ClientsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const clients = await trpc.listClients();

  return (
    <DashboardShell
      title="Clients"
      description="Browse and manage your clients."
      className="gap-4"
      headerActions={<NewClientSheet trigger="icon" />}
    >
      {clients.length === 0 && (
        <div className="flex h-[600px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          <h2 className="font-bold text-xl">{"No clients found"}</h2>
          <p className="max-w-sm text-base text-muted-foreground">
            {`It appears you don't have any clients registered yet. Get started by adding your first client.`}
          </p>
        </div>
      )}
      {clients.map((client) => (
        <ClientCard key={client.id} client={tson.serialize(client)} />
      ))}
    </DashboardShell>
  );
}
