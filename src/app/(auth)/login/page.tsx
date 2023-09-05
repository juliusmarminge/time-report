import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { CSRF_experimental } from "~/lib/auth";
import { Button } from "~/ui/button";

export const runtime = "edge";

export default function LoginPage() {
  return (
    <>
      <h1>Sign in</h1>
      <form action={`/api/auth/signin/github`} method="post">
        <Button type="submit">
          <GitHubLogoIcon className="h-4 w-4" />
          Sign in with GitHub
        </Button>
        <CSRF_experimental />
      </form>
    </>
  );
}
