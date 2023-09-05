"use client";

import { useCallback, useState } from "react";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import type { Dinero } from "dinero.js";
import { dinero, toDecimal } from "dinero.js";

import { LoadingDots } from "~/components/loading-dots";
import type { Timeslot } from "~/db/getters";
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
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { deleteTimeslot, updateTimeslot } from "./_actions";

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
  const [editingDuration, setEditingDuration] = useState(props.slot.duration);
  const [editingChargeRate, setEditingChargeRate] = useState(
    toDecimal(props.chargeRate),
  );
  const [editingCurrency, setEditingCurrency] = useState<string>(
    props.slot.currency,
  );

  const [updating, setUpdating] = useState(false);
  const updateSlot = useCallback(async () => {
    setUpdating(true);
    await updateTimeslot(props.slot.id, {
      duration: editingDuration,
      chargeRate: editingChargeRate,
      currency: editingCurrency,
    });
    setUpdating(false);
    props.setIsEditing(false);
  }, [editingChargeRate, editingCurrency, editingDuration, props.slot]);

  return (
    <Card>
      <div className="flex items-start gap-2 p-6">
        <CardHeader className="p-0">
          <CardTitle>{props.slot.clientName}</CardTitle>
          <Label>
            <span className="text-sm font-medium text-muted-foreground">
              Duration
            </span>
            <Input
              value={editingDuration}
              onChange={(e) => setEditingDuration(e.currentTarget.value)}
            />
          </Label>
          <Label>
            <span className="text-sm font-medium text-muted-foreground">
              Charge rate
            </span>
            <div className="flex gap-1">
              <Select
                onValueChange={setEditingCurrency}
                value={editingCurrency}
              >
                <SelectTrigger className="w-max">
                  <SelectValue />
                </SelectTrigger>
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
              <Input
                value={editingChargeRate}
                onChange={(e) => setEditingChargeRate(e.currentTarget.value)}
              />
            </div>
          </Label>
        </CardHeader>
        <Button variant="ghost" size="icon" type="submit" className="ml-auto">
          {updating ? (
            <LoadingDots className="h-4 w-4" />
          ) : (
            <CheckIcon className="h-4 w-4" onClick={updateSlot} />
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
                  onClick={() => deleteTimeslot(props.slot.id)}
                >
                  <Button variant="destructive">Yes, Delete</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
