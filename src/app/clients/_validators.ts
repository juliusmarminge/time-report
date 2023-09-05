import { coerce, length, minLength, number, object, string } from "valibot";

export const createClientSchema = object({
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: coerce(number(), Number),
  currency: string([length(3, "Currency must be 3 characters.")]),
  image: string("Required"),
});
