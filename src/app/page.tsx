import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTeams, getCriteria } from "@/lib/scoring-service";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Demo Day LAN Datathon 2026",
  description: "Sistem penilaian dewan juri dan rekapitulasi nilai Demo Day LAN Datathon 2026",
};

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === "admin") redirect("/admin");
    if (session.role === "judge") redirect("/judge");
  }

  const teams = await getTeams();
  const criteria = await getCriteria();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Navbar session={session} />

      <main className="flex-1">
        {/* Minimal Hero */}
        <section className="py-16 sm:py-24 border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Lembaga Administrasi Negara Republik Indonesia</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Demo Day LAN Datathon 2026
            </h1>

            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Sistem penilaian terintegrasi Dewan Juri & Dashboard Rekapitulasi Hasil Kompetisi Inovasi Data.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link href="/login">
                <Button size="lg" variant="default" className="gap-2 font-semibold">
                  Mulai Penjurian
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-medium">
                  Portal Admin & Rekap
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Section: Teams & Criteria */}
        <section className="py-12 sm:py-16 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Participating Teams */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Tim Peserta Finalis
                </h2>
                <p className="text-xs text-neutral-500">
                  5 tim peserta yang mempresentasikan proyek pada Demo Day
                </p>
              </div>

              <div className="space-y-2.5">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {team.orderNo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {team.name}
                        </h3>
                        {team.leadName && (
                          <span className="text-xs text-neutral-400">
                            {team.leadName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                        {team.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Kriteria & Bobot
                </h2>
                <p className="text-xs text-neutral-500">
                  5 aspek penilaian resmi (Total 100%)
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-neutral-900">
                {criteria.map((c) => (
                  <div key={c.id} className="pb-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {c.order}. {c.name}
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {(c.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-400">
        <p>&copy; 2026 Lembaga Administrasi Negara Republik Indonesia (LAN RI)</p>
      </footer>
    </div>
  );
}
