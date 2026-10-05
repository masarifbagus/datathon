import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminLeaderboard } from "@/lib/scoring-service";
import { Navbar } from "@/components/navbar";
import { AdminClient } from "./admin-client";

export const metadata = {
  title: "Dashboard Rekapitulasi Penilaian | LAN Datathon 2026",
  description: "Live matrix leaderboard and evaluation recap for LAN Datathon 2026",
};

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.role !== "admin") {
    redirect("/judge");
  }

  const initialData = await getAdminLeaderboard();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900">
      <Navbar session={session} />
      <main className="flex-1">
        <AdminClient session={session} initialData={initialData} />
      </main>
    </div>
  );
}
