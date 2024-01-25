"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { LoadingDots } from "~/ui/loading-dots";

export function EmailSignIn() {
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl");
  const emailSent = search.get("email");

  const signInWithLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    setIsLoading(true);

    const email = new FormData(form).get("email") as string;
    const cb = new URL(callbackUrl ?? "/report", window.location.href);
    await signIn("email", {
      email,
      redirect: false,
      callbackUrl: cb.href,
    });

    const url = new URL(window.location.href);
    url.searchParams.set("email", email);
    router.push(url.href);

    setIsLoading(false);
  };

  const verifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const url = new URL(window.location.href);
    const token = new FormData(e.currentTarget).get("token") as string;

    url.pathname = "/api/auth/callback/email";
    url.searchParams.set("token", token);

    router.push(url.href);
    router.refresh();
  };

  if (emailSent) {
    return (
      <form className="grid gap-2" onSubmit={verifyOtp}>
        <div className="grid gap-1">
          <Input name="token" placeholder="abc123" className="bg-background" />
        </div>
        <Button disabled={isLoading}>
          {isLoading && <LoadingDots className="mr-2 h-4 w-4" />}
          Confirm
        </Button>
      </form>
    );
  }

  return (
    <form className="grid gap-2" onSubmit={signInWithLink}>
      <div className="grid gap-1">
        <Input
          name="email"
          className="bg-background"
          defaultValue="foo@bar.com"
        />
      </div>
      <Button disabled={isLoading}>
        {isLoading && <LoadingDots className="mr-2 h-4 w-4" />}
        Sign In with Email
      </Button>
    </form>
  );
}
