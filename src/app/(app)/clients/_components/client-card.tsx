"use client";

import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import type { Dinero } from "dinero.js";
import { dinero, toDecimal } from "dinero.js";
import type { TsonSerialized } from "tupleson";
import * as v from "valibot";

import { LoadingDots } from "~/components/loading-dots";
import type { Client } from "~/db/queries";
import { useConverter } from "~/lib/converter";
import { currencies, formatMoney } from "~/lib/currencies";
import { slotsToDineros, sumDineros } from "~/lib/monetary";
import { formatOrdinal, isPast } from "~/lib/temporal";
import { tson } from "~/lib/tson";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader } from "~/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { deleteClient, updateClient } from "../_actions";

export function ClientCard(props: { client: TsonSerialized<Client> }) {
  const client = tson.deserialize(props.client);

  const defaultCharge = dinero({
    amount: client.defaultCharge,
    currency: currencies[client.currency],
  });

  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) {
    return (
      <EditingClientCard
        client={client}
        setIsEditing={setIsEditing}
        defaultCharge={defaultCharge}
      />
    );
  }

  const sortedPeriods = client.periods.sort((a, b) =>
    Temporal.PlainDate.compare(b.startDate, a.startDate),
  );

  const converter = useConverter();
  const periodAmounts = sortedPeriods.map((p) =>
    sumDineros({
      dineros: slotsToDineros(p.timeslot),
      currency: converter.preferredCurrency,
      converter: converter.convert,
    }),
  );

  const clientTotal = sumDineros({
    dineros: periodAmounts,
    currency: converter.preferredCurrency,
    converter: converter.convert,
  });

  return (
    <Card>
      <div className="flex items-start justify-between p-6">
        <CardHeader className="flex-row items-center gap-4 p-0">
          <Avatar className="h-12 w-12 rounded-sm">
            {client.image && <AvatarImage src={client.image} alt="" />}
            <AvatarFallback>{client.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{client.name}</h2>
            <p className="text-sm text-muted-foreground">
              Created: {format(client.createdAt, "MMMM do yyyy")},{" "}
              {client.currency && client.defaultCharge && (
                <p className="text-sm text-muted-foreground">
                  {`Invoiced `}
                  {client.defaultBillingPeriod}
                  {` at `}
                  {toDecimal(defaultCharge, (money) => formatMoney(money))}
                  {` an hour `}
                </p>
              )}
            </p>
          </div>
        </CardHeader>
        <Button
          variant="ghost"
          className="ml-auto"
          size="icon"
          onClick={() => setIsEditing(true)}
        >
          <Pencil1Icon className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="flex flex-col gap-4 p-6 pt-0">
        <h3 className="text-base font-semibold">
          Total invoiced: {toDecimal(clientTotal, formatMoney)}
        </h3>

        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">Billing Periods</h3>
          <ul className="flex flex-col gap-2">
            {sortedPeriods.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-1">
                <div key={p.id} className="flex items-center gap-2">
                  <Badge
                    className="capitalize"
                    variant={p.status === "open" ? "default" : "secondary"}
                  >
                    {p.status}
                  </Badge>
                  {isPast(p.endDate) && p.status === "open" && (
                    <Badge variant="destructive" className="ml-auto">
                      Expired
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatOrdinal(p.startDate)} to {formatOrdinal(p.endDate)}
                  </p>
                </div>
                <p className="text-sm">
                  {p.status === "closed" ? "Invoiced" : "Reported"}{" "}
                  {p.timeslot.reduce((acc, slot) => +slot.duration + acc, 0)}{" "}
                  hours for a total of{" "}
                  <b>{toDecimal(periodAmounts[i], formatMoney)}</b>
                </p>
              </div>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function EditingClientCard(props: {
  client: Client;
  setIsEditing: (value: boolean) => void;
  defaultCharge: Dinero<number>;
}) {
  const { client } = props;

  const form = useForm({
    schema: v.object({
      name: v.string(),
      chargeRate: v.string(),
      currency: v.string(),
      period: v.string(),
    }),
    defaultValues: {
      name: client.name,
      chargeRate: toDecimal(props.defaultCharge),
      currency: client.currency,
      period: client.defaultBillingPeriod,
    },
  });

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await updateClient(props.client.id, {
              name: data.name,
              currency: data.currency,
              defaultCharge: data.chargeRate,
              defaultBillingPeriod: data.period,
            });
            props.setIsEditing(false);
          })}
        >
          <div className="flex items-start gap-2 p-6">
            <CardHeader className="flex-row items-center gap-4 p-0">
              <Avatar className="h-12 w-12 rounded-sm">
                {client.image && <AvatarImage src={client.image} alt="" />}
                <AvatarFallback>{client.name[0]}</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(client.createdAt, "MMMM do yyyy")}
                    </p>
                  </FormItem>
                )}
              />
            </CardHeader>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="ml-auto"
            >
              {form.formState.isSubmitting ? (
                <LoadingDots className="h-5 w-5" />
              ) : (
                <CheckIcon className="h-5 w-5" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete client</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`Are you sure you want to delete the client "${client.name}"? `}
                    {`This will also delete all timeslots for this client.`}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      asChild
                      onClick={async () => {
                        await deleteClient({ id: client.id });
                      }}
                    >
                      <Button variant="destructive">Yes, Delete</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <CardContent className="flex flex-col gap-4 p-6 pt-0">
            {client.currency && client.defaultCharge && (
              <FormField
                control={form.control}
                name="chargeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Charge rate
                    </FormLabel>
                    <div className="flex gap-1">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-max">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <ScrollArea className="h-64">
                                {Object.entries(currencies).map(
                                  ([code, value]) => (
                                    <SelectItem key={code} value={code}>
                                      {value.code}
                                    </SelectItem>
                                  ),
                                )}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <FormItem className="w-full">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    </div>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Default billing period
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["weekly", "biweekly", "monthly"].map((period) => (
                          <SelectItem
                            key={period}
                            value={period}
                            className="capitalize"
                          >
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
