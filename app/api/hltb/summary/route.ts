// app/api/hltb/summary/route.ts
import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/hltb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getDashboardSummary();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load HLTB summary" },
      { status: 500 }
    );
  }
}
