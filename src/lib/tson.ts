import { Temporal } from "@js-temporal/polyfill";
import type { TsonType } from "tupleson";
import { createTson, tsonDate, tsonMap } from "tupleson";

const plainDate = {
  deserialize: (v) => Temporal.PlainDate.from(v),
  key: "PlainDate",
  serialize: (v) => v.toJSON(),
  test: (v) => v instanceof Temporal.PlainDate,
} satisfies TsonType<Temporal.PlainDate, string>;

const instant = {
  deserialize: (v) => Temporal.Instant.from(v),
  key: "Instant",
  serialize: (v) => v.toJSON(),
  test: (v) => v instanceof Temporal.Instant,
} satisfies TsonType<Temporal.Instant, string>;

export const tson = createTson({
  types: [plainDate, instant, tsonMap, tsonDate],
});
