declare module "eslint-config-prettier" {
  import type { Rule } from "eslint";
  export const rules: Record<string, Rule>;
}

declare module "eslint-plugin-import" {
  import type { Rule } from "eslint";
  export const rules: Record<string, Rule>;
}
