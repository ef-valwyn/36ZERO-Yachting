import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's error monitoring
export function GET() {
  try {
    // @ts-expect-error - Intentionally calling undefined function to test Sentry
    myUndefinedFunction();
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Test error captured by Sentry" },
      { status: 500 }
    );
  }
  return NextResponse.json({ data: "Testing Sentry Error..." });
}
