import { createHttpClient } from "edgedb";

export const edgedb = createHttpClient({
  tlsSecurity: process.env.EDGEDB_SECRET_KEY ? "default" : "insecure",
});

export { default as e } from "@edgedb-gen/edgeql-js";
export * from "@edgedb-gen/interfaces";
