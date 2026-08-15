import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, cookieOptionen } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(`${req.nextUrl.origin}/`, { status: 303 });
  res.cookies.set(COOKIE_NAME, "", { ...cookieOptionen, maxAge: 0 });
  return res;
}
