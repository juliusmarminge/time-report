import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { DashboardShell } from "~/components/dashboard-shell";
import { CSRF_experimental } from "~/lib/auth";
import { Button } from "~/ui/button";

export const runtime = "edge";

export default function LoginPage() {
  return (
    <DashboardShell title="Sign in">
      <form action={`/api/auth/signin/github`} method="post">
        <Button type="submit" variant="accent">
          <GitHubLogoIcon className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>
        <CSRF_experimental />
      </form>
    </DashboardShell>
  );
}
