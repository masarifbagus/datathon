import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTeams, getCriteria, getJudgeScoresMap } from "@/lib/scoring-service";
import { Navbar } from "@/components/navbar";
import { JudgeClient } from "./judge-client";

export const metadata = {
  title: "Lembar Penilaian Dewan Juri | LAN Datathon 2026",
  description: "Form input nilai dan komentar dewan juri Demo Day LAN Datathon 2026",
};

export default async function JudgePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/judge");
  }

  if (session.role !== "judge") {
    redirect("/admin");
  }

  const [teams, criteria, scoresMap] = await Promise.all([
    getTeams(),
    getCriteria(),
    getJudgeScoresMap(session.userId),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar session={session} />
      <main className="flex-1">
        <JudgeClient
          session={session}
          teams={teams}
          criteria={criteria}
          initialScoresMap={scoresMap}
        />
      </main>
    </div>
  );
}
