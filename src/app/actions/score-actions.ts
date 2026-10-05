"use server";

import { getSession } from "@/lib/auth";
import { saveJudgeScore } from "@/lib/scoring-service";
import { revalidatePath } from "next/cache";

export type SubmitScoreResult =
  | { success: true; totalWeightedScore: number; message: string }
  | { success: false; error: string };

export async function submitJudgeScoreAction(payload: {
  teamId: string;
  rawScores: Record<string, number>;
  criterionComments?: Record<string, string>;
  comment?: string;
}): Promise<SubmitScoreResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }

  if (session.role !== "judge") {
    return { success: false, error: "Hanya juri yang berhak memberikan penilaian." };
  }

  try {
    const result = await saveJudgeScore({
      judgeId: session.userId,
      teamId: payload.teamId,
      rawScores: payload.rawScores,
      criterionComments: payload.criterionComments,
      comment: payload.comment || "",
    });

    revalidatePath("/judge");
    revalidatePath("/admin");

    return {
      success: true,
      totalWeightedScore: result.totalWeightedScore,
      message: "Nilai dan komentar berhasil disimpan!",
    };
  } catch (error) {
    console.error("Error submitting judge score:", error);
    return {
      success: false,
      error: "Gagal menyimpan nilai. Terjadi kesalahan pada server.",
    };
  }
}
