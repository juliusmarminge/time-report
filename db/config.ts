import type { Config } from "drizzle-kit";

export const credentials = (() => {
  // Some extra fiddling to get the credentials right for PScale and the Proxy as well as getting it
  // to work with Drizzle and DrizzleKit... Tedious, I know. But now we can just `PS_PROXY=1 p dev / db:push`
  const c = {
    database: process.env.DB_NAME!,
    host: "aws.connect.psdb.cloud",
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
  };

  if (process.env.PS_PROXY) {
    return {
      url: "http://root:whatever@127.0.0.1:8080",
      pushUrl: `mysql://root:@127.0.0.1:3306/${c.database}`,
    };
  }

  const pushUrl = new URL(c.database, `mysql://${c.host}:3306`);
  pushUrl.username = c.username;
  pushUrl.password = c.password;
  pushUrl.searchParams.set("ssl", '{"rejectUnauthorized":true}');
  return Object.assign(c, { pushUrl: pushUrl.href });
})();

export default {
  dbCredentials: { uri: credentials.pushUrl },
  driver: "mysql2",
  schema: "./db/schema.ts",
} satisfies Config;
