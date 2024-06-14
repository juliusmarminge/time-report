"use client";

import { useEffect, useId } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Button } from "~/ui/button";
import { LoadingDots } from "~/ui/loading-dots";
import { joinWaitlist } from "../_action";

export function Waitlist() {
  const id = useId();
  const [state, dispatch, pending] = useFormState(joinWaitlist, null);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.error);
    } else {
      toast.success("Thank you for joining the waitlist!");
    }
  }, [state]);

  return (
    <form
      action={dispatch}
      className="relative isolate mt-8 flex items-center pr-1"
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>

      <input
        required
        type="email"
        autoComplete="email"
        name="email"
        id={id}
        placeholder="Email address"
        className="peer w-0 flex-auto bg-transparent px-4 py-2.5 text-base text-white placeholder:text-white/50 sm:text-[0.8125rem]/6 focus:outline-none"
      />
      <Button type="submit" className="shrink-0">
        {pending && <LoadingDots className="mr-2 h-4 w-4" />}
        Join waitlist
      </Button>
      <div className="-z-10 absolute inset-0 rounded-lg transition peer-focus:ring-2 peer-focus:ring-ring" />
      <div className="-z-10 absolute inset-0 rounded-lg bg-white/2.5 ring-1 ring-gray-400/30 transition peer-focus:ring-ring" />
    </form>
  );
}
