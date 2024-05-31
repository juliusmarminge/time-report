"use client";

import { signIn } from "next-auth/webauthn";
import { toMonthParam } from "~/lib/temporal";
import { Button } from "~/ui/button";
import { PasskeyIcon } from "~/ui/icons";

export function PasskeyLogin() {
  return (
    <div>
      <Button
        className="w-full max-w-60"
        onClick={() =>
          signIn("passkey", {
            callbackUrl: `/report/${toMonthParam()}`,
          })
        }
      >
        <PasskeyIcon className="mr-2 size-4" />
        Sign in with Passkey
      </Button>
    </div>
  );
}
