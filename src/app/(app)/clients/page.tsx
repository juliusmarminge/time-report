import { redirect } from "next/navigation";

import { DashboardShell } from "~/components/dashboard-shell";
import { getClients } from "~/db/queries";
import { currentUser } from "~/lib/auth";
import { withUnstableCache } from "~/lib/cache";
import { tson } from "~/lib/tson";
import { ClientCard } from "./_components/client-card";
import { NewClientSheet } from "./_components/new-client-form";

export const runtime = "edge";

export default async function ClientsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const clients = await withUnstableCache({
    fn: getClients,
    args: [user.id],
    tags: ["clients"],
  });

  return (
    <DashboardShell
      title="Clients"
      description="Browse and manage your clients."
      className="gap-4"
      headerActions={<NewClientSheet trigger="icon" />}
    >
      {clients.length === 0 && (
        <div className="flex h-[600px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
          <h2 className="text-xl font-bold">{`No clients found`}</h2>
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
