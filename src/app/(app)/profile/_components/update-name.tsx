"use client";

import { Button } from "~/ui/button";
import { CardContent, CardFooter } from "~/ui/card";
import { Input } from "~/ui/input";
import type { User } from "next-auth";
import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export function UpdateNameForm(props: { user: User }) {
  const { mutate: updateDisplayName } = trpc.updateDisplayName.useMutation({
    onSuccess: () => {
      toast.success("Name updated");
    },
  });

  return (
    <form action={(fd) => updateDisplayName(fd.get("name") as string)}>
      <CardContent>
        <Input
          name="name"
          placeholder="John Doe"
          defaultValue={props.user.name ?? ""}
        />
      </CardContent>
      <CardFooter className="justify-between border-t px-6 py-4">
        <p className="text-muted-foreground text-sm">
          Please use 32 characters at maximum.
        </p>
        <Button size="sm">Save</Button>
      </CardFooter>
    </form>
  );
}
