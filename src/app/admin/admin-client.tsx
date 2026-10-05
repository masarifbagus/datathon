"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { RefreshCw, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import type { TeamLeaderboardRow, UserItem, CriterionItem } from "@/lib/scoring-service";
import type { SessionPayload } from "@/lib/auth";

interface AdminClientProps {
  session: SessionPayload;
  initialData: {
    rows: TeamLeaderboardRow[];
    judges: UserItem[];
    criteria: CriterionItem[];
    totalTeams: number;
    totalSubmissions: number;
    totalPossibleSubmissions: number;
    topTeam: TeamLeaderboardRow | null;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal");
  const json = await res.json();
  return json.data;
};

export function AdminClient({ session, initialData }: AdminClientProps) {
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const [selectedRow, setSelectedRow] = useState<TeamLeaderboardRow | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data, isValidating, mutate } = useSWR("/api/leaderboard", fetcher, {
    fallbackData: initialData,
    refreshInterval: refreshInterval,
    revalidateOnFocus: true,
  });

  const leaderboard = data || initialData;
  const rows: TeamLeaderboardRow[] = leaderboard.rows || [];
  const judges: UserItem[] = leaderboard.judges || [];
  const totalTeams = leaderboard.totalTeams || rows.length;
  const totalSubmissions = leaderboard.totalSubmissions || 0;
  const totalPossible = leaderboard.totalPossibleSubmissions || (totalTeams * judges.length);
  const topTeam = leaderboard.topTeam || (rows.length > 0 && rows[0].finalScore !== null ? rows[0] : null);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.info("Menyiapkan file Excel...");

      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Gagal");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rekap_Nilai_LAN_Datathon_2026_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("File Excel berhasil diunduh.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            Rekapitulasi Penilaian
          </h1>
          <p className="text-xs text-neutral-400">
            Demo Day LAN Datathon 2026
          </p>
        </div>

        {/* Polling & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                refreshInterval > 0 ? "bg-blue-600" : "bg-neutral-300"
              }`}
            />
            <span className="text-neutral-500">
              {refreshInterval > 0 ? "Live" : "Jeda"}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => mutate()}
            disabled={isValidating}
            className="h-8 text-xs px-2.5"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isValidating ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="h-8 text-xs font-semibold px-3"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
            {isExporting ? "..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Total Tim</span>
          <p className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
            {totalTeams}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Dewan Juri</span>
          <p className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
            {judges.length}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Progres Nilai</span>
          <p className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
            {totalSubmissions}/{totalPossible}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Peringkat 1</span>
          <p className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5 truncate">
            {topTeam && topTeam.finalScore !== null ? topTeam.team.name : "-"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-mono text-neutral-400 uppercase">
                <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                <th className="py-2.5 px-3">Nama Tim</th>
                {judges.map((j) => (
                  <th key={j.id} className="py-2.5 px-2.5 text-center w-20">
                    {j.name}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center w-28 font-bold text-neutral-900 dark:text-white">
                  Nilai Akhir
                </th>
                <th className="py-2.5 px-3 text-center w-20">Juri</th>
                <th className="py-2.5 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {rows.map((row, index) => {
                const isTop1 = row.rank === 1 && row.finalScore !== null;

                return (
                  <tr
                    key={row.team.id}
                    onClick={() => setSelectedRow(row)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-mono">
                      {isTop1 ? (
                        <span className="inline-block px-1.5 py-0.2 rounded bg-neutral-900 text-white font-bold text-[10px]">
                          #1
                        </span>
                      ) : (
                        <span className="text-neutral-400">
                          #{row.rank > 0 ? row.rank : index + 1}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {row.team.name}
                      </span>
                    </td>

                    {judges.map((j) => {
                      const scoreItem = row.judgeScores[j.username];
                      return (
                        <td key={j.id} className="py-3 px-2.5 text-center font-mono">
                          {scoreItem !== null ? (
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {scoreItem.totalWeightedScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      {row.finalScore !== null ? (
                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                          {row.finalScore.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-mono text-neutral-300">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[11px] text-neutral-400">
                      {row.submittedCount}/{row.totalJudges}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        maxWidth="xl"
      >
        {selectedRow && (
          <div className="space-y-4">
            <ModalHeader>
              <ModalTitle>{selectedRow.team.name}</ModalTitle>
            </ModalHeader>

            <ModalBody className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Nilai Akhir:</span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedRow.finalScore !== null ? selectedRow.finalScore.toFixed(2) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Peringkat:</span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedRow.rank > 0 ? `#${selectedRow.rank}` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Juri Selesai:</span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedRow.submittedCount}/{selectedRow.totalJudges}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {judges.map((judge) => {
                  const scoreItem = selectedRow.judgeScores[judge.username];

                  return (
                    <div
                      key={judge.id}
                      className="p-3 rounded border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{judge.name}</span>
                        <span className="font-mono">
                          {scoreItem ? scoreItem.totalWeightedScore.toFixed(2) : "-"}
                        </span>
                      </div>

                      {scoreItem && scoreItem.comment && (
                        <p className="text-neutral-500 italic text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800">
                          &ldquo;{scoreItem.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedRow(null)}>
                Tutup
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
