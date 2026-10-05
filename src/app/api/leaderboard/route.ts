import { NextResponse } from "next/server";
import { getAdminLeaderboard } from "@/lib/scoring-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAdminLeaderboard();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data leaderboard" },
      { status: 500 }
    );
  }
}
