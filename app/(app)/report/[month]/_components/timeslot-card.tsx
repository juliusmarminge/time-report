"use client";

import { useState } from "react";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import type { Dinero } from "dinero.js";
import { dinero, toDecimal } from "dinero.js";
import * as v from "valibot";

import type { Timeslot } from "~/db/queries";
import { currencies, formatMoney } from "~/lib/currencies";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "~/ui/form";
import { Input, InputField } from "~/ui/input";
import { LoadingDots } from "~/ui/loading-dots";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { deleteTimeslot, updateTimeslot } from "../_actions";

export function TimeslotCard(props: { slot: Timeslot }) {
  const [isEditing, setIsEditing] = useState(false);
  const chargeRate = dinero({
    amount: props.slot.chargeRate,
    currency: currencies[props.slot.currency],
  });

  if (isEditing) {
    return (
      <EditingTimeslotCard
        slot={props.slot}
        setIsEditing={setIsEditing}
        chargeRate={chargeRate}
      />
    );
  }

  return (
    <Card>
      <div className="flex items-start p-6">
        <CardHeader className="p-0">
          <CardTitle>{props.slot.clientName}</CardTitle>
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
      <CardContent>
        <p className="text-base font-bold text-muted-foreground">
          {props.slot.duration}
          {`h`}
          <span className="font-normal">{` @ `}</span>
          {toDecimal(chargeRate, (money) => formatMoney(money))}
        </p>
      </CardContent>
    </Card>
  );
}

function EditingTimeslotCard(props: {
  slot: Timeslot;
  setIsEditing: (value: boolean) => void;
  chargeRate: Dinero<number>;
}) {
  const form = useForm({
    schema: v.object({
      duration: v.string(),
      chargeRate: v.string(),
      currency: v.string(),
    }),
    defaultValues: {
      duration: props.slot.duration,
      chargeRate: toDecimal(props.chargeRate),
      currency: props.slot.currency,
    },
  });

  const [deleting, setDeleting] = useState(false);

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await updateTimeslot({
              id: props.slot.id,
              currency: data.currency,
              // @ts-expect-error unsure how to get input_in working with Valibot
              duration: data.duration,
              // @ts-expect-error unsure how to get input_in working with Valibot
              chargeRate: data.chargeRate,
            });
            props.setIsEditing(false);
          })}
        >
          <div className="flex items-start gap-2 p-6">
            <CardHeader className="p-0">
              <CardTitle>{props.slot.clientName}</CardTitle>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Duration
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chargeRate"
                render={({ field }) => (
                  <FormItem className="flex">
                    <FormLabel className="text-muted-foreground">
                      Charge rate
                    </FormLabel>
                    <InputField
                      {...field}
                      leading={
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-max rounded-none border-none bg-muted px-3 font-mono">
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
                      }
                    />
                    <FormMessage />
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
                <LoadingDots className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete timeslot</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`Are you sure you want to delete the timeslot for "${props.slot.clientName}"?`}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      asChild
                      onClick={async () => {
                        setDeleting(true);
                        await deleteTimeslot(props.slot.id);
                        setDeleting(false);
                      }}
                    >
                      <Button variant="destructive">
                        {deleting && <LoadingDots className="mr-2 h-4 w-4" />}
                        Yes, Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </Form>
    </Card>
  );
}
