"use client";

import { useCallback, useState } from "react";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import type { Dinero } from "dinero.js";
import { dinero, toDecimal } from "dinero.js";

import { LoadingDots } from "~/components/loading-dots";
import type { Client } from "~/db/getters";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader } from "~/ui/card";
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
import { deleteClient, updateClient } from "./_actions";

export function ClientCard(props: { client: Client }) {
  const { client } = props;
  const defaultCharge = dinero({
    amount: client.defaultCharge,
    currency: currencies[client.curr],
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
              Created: {format(client.createdAt, "MMMM do yyyy")}
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
      <CardContent className="p-6 pt-0">
        {client.curr && client.defaultCharge && (
          <p className="text-base text-muted-foreground">
            {`Default charge: `}
            {toDecimal(defaultCharge, (money) => formatMoney(money))}
          </p>
        )}
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
  const [updating, setUpdating] = useState(false);

  const [editingName, setEditingName] = useState(client.name);
  const [editingChargeRate, setEditingChargeRate] = useState(
    toDecimal(props.defaultCharge),
  );
  const [editingCurrency, setEditingCurrency] = useState<string>(client.curr);

  const updateClientInfo = useCallback(async () => {
    setUpdating(true);
    await updateClient(props.client.id, {
      name: editingName,
      currency: editingCurrency,
      defaultCharge: editingChargeRate,
    });
    setUpdating(false);
    props.setIsEditing(false);
  }, [editingName, editingChargeRate, editingCurrency, props.client]);

  return (
    <Card>
      <div className="flex items-start gap-2 p-6">
        <CardHeader className="flex-row items-center gap-4 p-0">
          <Avatar className="h-12 w-12 rounded-sm">
            {client.image && <AvatarImage src={client.image} alt="" />}
            <AvatarFallback>{client.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.currentTarget.value)}
            />
            <p className="text-sm text-muted-foreground">
              Created: {format(client.createdAt, "MMMM do yyyy")}
            </p>
          </div>
        </CardHeader>
        <Button
          variant="ghost"
          size="icon"
          type="submit"
          className="ml-auto"
          onClick={updateClientInfo}
        >
          {updating ? (
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
              <AlertDialogTitle>Delete timeslot</AlertDialogTitle>
              <AlertDialogDescription>
                {`Are you sure you want to delete the client "${client.name}"?`}
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
      <CardContent className="p-6 pt-0">
        {client.curr && client.defaultCharge && (
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
        )}
      </CardContent>
    </Card>
  );
}
