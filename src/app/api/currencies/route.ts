import { NextResponse } from "next/server";

import { auth } from "~/lib/auth";

export const revalidate = 60 * 60 * 24; // 24 hours

export interface FixerResponse {
  base: string;
  timestamp: number;
  date: string;
  rates: Record<string, number>;
}

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const res = await fetch(
    `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}`,
    { next: { revalidate: revalidate } },
  );
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const rates = ((await res.json()) as FixerResponse).rates;
  return NextResponse.json(rates);
});
