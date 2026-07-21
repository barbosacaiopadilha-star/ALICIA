import { NextResponse } from "next/server";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Health check mínimo: sem consulta externa, sem banco, sem secrets.
// version usa o SHA do commit exposto pela Vercel (repositório público).
export function GET() {
  const environment =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const version = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  logInfo("health.check", { environment });

  return NextResponse.json(
    {
      status: "ok",
      service: "alicia",
      environment,
      timestamp: new Date().toISOString(),
      version,
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
}
