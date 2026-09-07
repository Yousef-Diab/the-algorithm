import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const handler = auth?.handler();

const notConfigured = () =>
  NextResponse.json({ error: "Auth not configured" }, { status: 404 });

export const GET = handler ? handler.GET : notConfigured;
export const POST = handler ? handler.POST : notConfigured;
