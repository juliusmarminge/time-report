import {
  any,
  coerce,
  length,
  minLength,
  number,
  object,
  string,
} from "valibot";

export const createClientSchema = object({
  name: string([minLength(4, "Name must be at least 4 characters.")]),
  defaultCharge: coerce(number(), Number),
  currency: string([length(3, "Currency must be 3 characters.")]),
  // image: coerce(blob(), (file) => {
  //   if (!file) throw new Error("Image is required.");
  //   return new Blob([file as File], { type: (file as File).type });
  // }),
  image: any(),
});
