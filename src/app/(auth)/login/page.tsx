import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { signIn } from "~/lib/auth";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { EmailSignIn } from "./email";

export const runtime = "edge";

export default function LoginPage() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center">
      <div className="z-50 flex w-full max-w-md flex-col gap-4 rounded-3xl bg-muted/60 p-12 shadow-lg">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-extrabold">Sign in</h1>
            <p>
              to continue to <b>Time Report</b>
            </p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/report" });
          }}
        >
          <Button type="submit" className="px-10">
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className=" relative rounded border-2 border-dashed p-2">
            <Badge className="absolute -right-2 -top-2">DEV</Badge>
            <EmailSignIn />
          </div>
        )}
      </div>
    </div>
  );
}
