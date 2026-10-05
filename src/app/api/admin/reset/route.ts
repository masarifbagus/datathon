import { NextResponse } from "next/server";
import { resetAllScores } from "@/lib/scoring-service";

export async function POST() {
  try {
    const result = await resetAllScores();
    return NextResponse.json({
      success: true,
      message: `Database berhasil di-reset. Sebanyak ${result.count} data nilai dihapus.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Gagal mereset database:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mereset database" },
      { status: 500 }
    );
  }
}
