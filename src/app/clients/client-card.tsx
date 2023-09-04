"use client";

import Image from "next/image";
import { dinero, toDecimal } from "dinero.js";

import type { Client } from "~/db/getters";
import { currencies, formatMoney } from "~/lib/currencies";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader } from "~/ui/card";
import { deleteClient } from "./_actions";

export function ClientCard(props: { client: Client }) {
  const { client } = props;
  const defaultCharge = dinero({
    amount: client.defaultCharge,
    currency: currencies[client.curr],
  });

  return (
    <Card>
      <div className="flex items-start justify-between p-6">
        <CardHeader className="p-0">
          <Image src={client.image} alt="" />
          <h2 className="text-xl font-bold">{client.name}</h2>
        </CardHeader>
        <Button
          variant="destructive"
          onClick={() => deleteClient({ id: client.id })}
        >
          Delete
        </Button>
      </div>
      <CardContent className="p-6">
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
