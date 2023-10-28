import { Temporal } from "@js-temporal/polyfill";
import type { TsonType } from "tupleson";
import { createTson, tsonMap } from "tupleson";

const plainDate: TsonType<Temporal.PlainDate, string> = {
  deserialize: (v) => Temporal.PlainDate.from(v),
  key: "PlainDate",
  serialize: (v) => v.toJSON(),
  test: (v) => v instanceof Temporal.PlainDate,
};

export const tson = createTson({ types: [plainDate, tsonMap] });
