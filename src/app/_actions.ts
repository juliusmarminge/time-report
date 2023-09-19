"use server";

import { createAction } from "~/trpc/createaction";
import { trpc } from "~/trpc/server";

export const reportTimeslotAction = createAction(trpc.createTimeslot, {
  revalidates: [trpc.getTimeslots],
});

export const deleteTimeslotAction = createAction(trpc.deleteTimeslot, {
  revalidates: [trpc.getTimeslots],
});

export const updateTimeslotAction = createAction(trpc.updateTimeslot, {
  revalidates: [trpc.getTimeslots],
});

export const createClientAction = createAction(trpc.createClient, {
  revalidates: [trpc.getClientsForUser],
});

export const deleteClientAction = createAction(trpc.deleteClient, {
  revalidates: [trpc.getClientsForUser],
});

export const updateClientAction = createAction(trpc.updateClient, {
  revalidates: [trpc.getClientsForUser],
});

export const deleteImageFromUTAction = createAction(trpc.deleteImageFromUT, {
  revalidates: ["/"],
});
