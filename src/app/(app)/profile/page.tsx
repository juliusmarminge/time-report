import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { DashboardShell } from "../_components/shell";
import { currentUser } from "~/auth";
import { UpdateNameForm } from "./_components/update-name";
import { UpdateProfilePictureCard } from "./_components/update-profile-pic";

export default async function ProfilePage() {
  const user = await currentUser({ redirect: true });

  return (
    <DashboardShell
      title="Account Profile"
      description="Manage your account information."
      className="gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>Change your display name.</CardDescription>
        </CardHeader>
        <UpdateNameForm user={user} />
      </Card>

      <UpdateProfilePictureCard user={user} />
    </DashboardShell>
  );
}
