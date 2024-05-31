"use client";

import { signIn } from "next-auth/webauthn";
import { toMonthParam } from "~/lib/temporal";
import { Button } from "~/ui/button";

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
        <svg
          className="mr-2 size-4"
          viewBox="0 0 327 318"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Passkey</title>
          <circle cx="126" cy="75" r="75" />
          <path d="M1 265.5V308.5H217.5V216.5C206.425 208.008 200.794 201.073 192 184C180.063 178.025 173.246 176.622 161 175.5H91.5C45.1022 186.909 19.4472 194.075 1 265.5Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M268 208C300.585 208 327 181.585 327 149C327 116.415 300.585 90 268 90C235.415 90 209 116.415 209 149C209 181.585 235.415 208 268 208ZM268 149C276.837 149 284 141.837 284 133C284 124.163 276.837 117 268 117C259.163 117 252 124.163 252 133C252 141.837 259.163 149 268 149Z"
          />
          <path d="M242.5 292V203H289L309 225.5L284.5 250.5L309 275.5L267 316.5L242.5 292Z" />
        </svg>
        Sign in with Passkey
      </Button>
    </div>
  );
}
