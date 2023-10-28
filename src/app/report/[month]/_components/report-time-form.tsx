"use client";

import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { LoadingDots } from "~/components/loading-dots";
import type { Client } from "~/db/getters";
import { currencies } from "~/lib/currencies";
import { isFuture } from "~/lib/temporal";
import { useMobile } from "~/lib/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/ui/alert-dialog";
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
import { reportTime } from "../_actions";
import { reportTimeSchema } from "../_validators";

export function ReportTimeForm(props: {
  clients: Client[];
  date?: Temporal.PlainDate;
  afterSubmit?: () => void;
}) {
  const form = useForm({
    schema: reportTimeSchema,
    defaultValues: {
      date: props.date?.toString(),
      clientId: props.clients[0].id,
      currency: props.clients[0].currency,
      chargeRate: props.clients[0].defaultCharge / 100,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await reportTime({
            ...values,
            date: Temporal.PlainDate.from(values.date as string).toString(),
          });
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
                  client?.currency &&
                    form.setValue("currency", client.currency);
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

        <Button type="submit">
          {form.formState.isSubmitting && <LoadingDots className="mr-2" />}
          Report time
        </Button>
      </form>
    </Form>
  );
}

export function ReportTimeSheet(props: {
  date: Temporal.PlainDate;
  clients: Client[];
}) {
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog>
      <Sheet open={open} onOpenChange={setOpen}>
        {props.date && isFuture(props.date) ? (
          <AlertDialogTrigger asChild>
            <Button>Report time</Button>
          </AlertDialogTrigger>
        ) : (
          <SheetTrigger asChild>
            <Button>Report time</Button>
          </SheetTrigger>
        )}
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetHeader>
            <SheetTitle>Report time</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ReportTimeForm
              clients={props.clients}
              date={props.date}
              afterSubmit={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`You're about to report time for a future date `}
            <b>({props.date.toString()})</b>.
            {` Are you sure you want to continue?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => setOpen(true)}>
            Yes, continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
