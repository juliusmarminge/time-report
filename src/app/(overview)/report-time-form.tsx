"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseISO } from "date-fns";

import type { Client } from "~/db/getters";
import { currencies } from "~/lib/currencies";
import { Button } from "~/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/ui/form";
import { Input } from "~/ui/input";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/sheet";
import { Textarea } from "~/ui/textarea";
import { reportTime } from "./_actions";
import { reportTimeSchema } from "./_validators";

export function ReportTimeForm(props: {
  clients: Client[];
  afterSubmit?: () => void;
}) {
  const params = useSearchParams();
  const date = params.get("date");
  const form = useForm({
    schema: reportTimeSchema,
    defaultValues: {
      date: date ? parseISO(`${date}T00:00:00.000Z`) : undefined,
      clientId: props.clients[0].id,
      currency: props.clients[0].curr,
      chargeRate: props.clients[0].defaultCharge / 100,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          // FIXME: The `afterSubmit` should not be invoked before the request
          // But it seems like this promise doesn't resolve properly all the time
          props.afterSubmit?.();
          await reportTime(values);
          form.reset();
          props.afterSubmit?.();
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormDescription>
                Select the client you're reporting time for
              </FormDescription>

              <Select
                onValueChange={(value) => {
                  const client = props.clients.find(
                    (c) => String(c.id) === value,
                  );
                  field.onChange(value);

                  // Update the default charge and currency to match with the client
                  client?.defaultCharge &&
                    form.setValue("chargeRate", client.defaultCharge / 100);
                  client?.curr && form.setValue("currency", client.curr);
                }}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chargeRate"
          render={({ field }) => (
            <FormItem className="flex">
              <FormLabel>Charge rate</FormLabel>
              <FormDescription>
                Your hourly charge for this session.
              </FormDescription>
              <div className="flex gap-1">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-64">
                          {Object.entries(currencies).map(([code, value]) => (
                            <SelectItem key={code} value={code}>
                              {value.code}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} type="number" className="flex-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormDescription>
                The duration of the work in hours.
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                A short description of the work you did.
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="h-24" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Report time</Button>
      </form>
    </Form>
  );
}

export function ReportTimeSheet(props: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={props.clients.length === 0}>
        <Button>
          {props.clients.length > 0
            ? "Report time"
            : "Create a client to report time"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Report time</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <ReportTimeForm
            clients={props.clients}
            afterSubmit={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
