"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitJudgeScoreAction } from "@/app/actions/score-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import type { CriterionItem, TeamItem, JudgeScoreItem } from "@/lib/scoring-service";
import type { SessionPayload } from "@/lib/auth";

interface JudgeClientProps {
  session: SessionPayload;
  teams: TeamItem[];
  criteria: CriterionItem[];
  initialScoresMap: Record<string, JudgeScoreItem>;
}

const SCORE_PRESETS = [70, 75, 80, 85, 90, 95, 100];

export function JudgeClient({
  session,
  teams,
  criteria,
  initialScoresMap,
}: JudgeClientProps) {
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || "");
  const [scoresMap, setScoresMap] = useState<Record<string, JudgeScoreItem>>(initialScoresMap);
  const [isPending, startTransition] = useTransition();

  const currentTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || teams[0],
    [teams, selectedTeamId]
  );

  const currentSavedScore = scoresMap[selectedTeamId];

  const [formScores, setFormScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const c of criteria) {
      if (currentSavedScore) {
        const detail = currentSavedScore.details.find((d) => d.criterionId === c.id);
        initial[c.id] = detail ? String(detail.rawScore) : "80";
      } else {
        initial[c.id] = "80";
      }
    }
    return initial;
  });

  const [comment, setComment] = useState<string>(() => currentSavedScore?.comment || "");
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(criteria[0]?.id || null);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    const existing = scoresMap[teamId];
    const newFormScores: Record<string, string> = {};
    for (const c of criteria) {
      if (existing) {
        const detail = existing.details.find((d) => d.criterionId === c.id);
        newFormScores[c.id] = detail ? String(detail.rawScore) : "80";
      } else {
        newFormScores[c.id] = "80";
      }
    }
    setFormScores(newFormScores);
    setComment(existing?.comment || "");
  };

  const handleScoreChange = (criterionId: string, valueStr: string) => {
    setFormScores((prev) => ({
      ...prev,
      [criterionId]: valueStr,
    }));
  };

  const handlePresetSelect = (criterionId: string, val: number) => {
    setFormScores((prev) => ({
      ...prev,
      [criterionId]: String(val),
    }));
  };

  const liveTotalWeighted = useMemo(() => {
    let sum = 0;
    for (const c of criteria) {
      const raw = parseFloat(formScores[c.id]) || 0;
      const clamped = Math.max(0, Math.min(100, raw));
      sum += clamped * c.weight;
    }
    return Number(sum.toFixed(2));
  }, [criteria, formScores]);

  const handleSaveScore = () => {
    const numericScores: Record<string, number> = {};
    for (const c of criteria) {
      const valStr = formScores[c.id];
      if (!valStr || valStr.trim() === "") {
        toast.error(`Kriteria "${c.name}" wajib diisi!`);
        setActiveCriterionId(c.id);
        return;
      }
      const num = parseFloat(valStr);
      if (isNaN(num) || num < 0 || num > 100) {
        toast.error(`Nilai ${c.name} harus di antara 0 dan 100.`);
        setActiveCriterionId(c.id);
        return;
      }
      numericScores[c.id] = num;
    }

    startTransition(async () => {
      try {
        const res = await submitJudgeScoreAction({
          teamId: selectedTeamId,
          rawScores: numericScores,
          comment: comment.trim(),
        });

        if (res.success) {
          toast.success(`Nilai disimpan! Total: ${res.totalWeightedScore.toFixed(2)}`);

          const updatedDetails = criteria.map((c) => {
            const raw = numericScores[c.id] ?? 0;
            return {
              criterionId: c.id,
              criterionCode: c.code,
              criterionName: c.name,
              weight: c.weight,
              rawScore: raw,
              weightedScore: Number((raw * c.weight).toFixed(2)),
            };
          });

          setScoresMap((prev) => ({
            ...prev,
            [selectedTeamId]: {
              scoreId: `saved_${selectedTeamId}`,
              judgeId: session.userId,
              judgeUsername: session.username,
              judgeName: session.name,
              teamId: selectedTeamId,
              totalWeightedScore: res.totalWeightedScore,
              comment: comment.trim(),
              updatedAt: new Date().toISOString(),
              details: updatedDetails,
            },
          }));

          router.refresh();
        } else {
          toast.error(res.error || "Gagal menyimpan.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kendala jaringan.");
      }
    });
  };

  const handleResetForm = () => {
    const resetScores: Record<string, string> = {};
    for (const c of criteria) resetScores[c.id] = "";
    setFormScores(resetScores);
    setComment("");
    toast.info("Formulir dikosongkan.");
  };

  const currentIdx = teams.findIndex((t) => t.id === selectedTeamId);
  const handlePrevTeam = () => {
    if (currentIdx > 0) handleSelectTeam(teams[currentIdx - 1].id);
  };
  const handleNextTeam = () => {
    if (currentIdx < teams.length - 1) handleSelectTeam(teams[currentIdx + 1].id);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            {session.name}
          </h1>
          <p className="text-xs text-neutral-400">
            Penilaian Demo Day
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-neutral-400">
            {Object.keys(scoresMap).length}/{teams.length} Dinilai
          </span>
        </div>
      </div>

      {/* Team Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {teams.map((team, idx) => {
          const isSelected = team.id === selectedTeamId;
          const isScored = Boolean(scoresMap[team.id]);
          const scoreVal = scoresMap[team.id]?.totalWeightedScore;

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => handleSelectTeam(team.id)}
              className={`py-2 px-3 rounded-md border text-left transition-colors cursor-pointer ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-mono opacity-60">#{idx + 1}</span>
                {isScored && (
                  <span className="font-mono font-bold text-[10px] flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5 text-blue-500" />
                    {scoreVal?.toFixed(0)}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold truncate">
                {team.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Team Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            {currentTeam.orderNo}. {currentTeam.name}
          </h2>
          {currentTeam.leadName && (
            <p className="text-xs text-neutral-400">
              {currentTeam.leadName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevTeam}
            disabled={currentIdx === 0}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <span className="text-xs font-mono text-neutral-400 px-1">
            {currentIdx + 1}/{teams.length}
          </span>
          <button
            type="button"
            onClick={handleNextTeam}
            disabled={currentIdx === teams.length - 1}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Criteria Cards (Concise, Clean, Less Text) */}
      <div className="space-y-3">
        {criteria.map((c) => {
          const currentVal = formScores[c.id] ?? "";
          const num = parseFloat(currentVal);
          const isValidNumber = !isNaN(num) && num >= 0 && num <= 100 && currentVal.trim() !== "";
          const weightedContribution = isValidNumber ? Number((num * c.weight).toFixed(2)) : 0;
          const isActive = activeCriterionId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => setActiveCriterionId(c.id)}
              className={`rounded-lg bg-white dark:bg-neutral-900 border p-4 space-y-2.5 transition-colors ${
                isActive
                  ? "border-neutral-400 dark:border-neutral-600 border-l-2 border-l-blue-600"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {c.order}. {c.name}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {(c.weight * 100).toFixed(0)}%
                </span>
              </div>

              {/* Input + Presets Row */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <div className="relative flex items-center w-28">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="0-100"
                    value={currentVal}
                    onFocus={() => setActiveCriterionId(c.id)}
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    className="w-full py-1.5 px-2.5 text-sm font-mono font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  {isValidNumber && (
                    <span className="absolute right-2 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      +{weightedContribution.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {SCORE_PRESETS.map((preset) => {
                    const isSelected = currentVal === String(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(c.id, preset)}
                        className={`text-xs font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 font-bold"
                            : "bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Comment */}
        <div
          onClick={() => setActiveCriterionId("comment")}
          className={`rounded-lg bg-white dark:bg-neutral-900 border p-4 space-y-2 transition-colors ${
            activeCriterionId === "comment"
              ? "border-neutral-400 dark:border-neutral-600 border-l-2 border-l-blue-600"
              : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            Catatan (Opsional)
          </span>

          <textarea
            rows={2}
            value={comment}
            onFocus={() => setActiveCriterionId("comment")}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis masukan untuk tim ini..."
            className="w-full p-2.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white resize-y"
          />
        </div>

        {/* Minimal Bottom Bar */}
        <div className="sticky bottom-4 z-30 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-neutral-200 dark:border-neutral-800 p-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-neutral-400 font-mono">Skor:</span>
              <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                {liveTotalWeighted.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetForm}
                className="text-xs text-neutral-400 h-8 px-2"
              >
                Reset
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSaveScore}
                disabled={isPending}
                className="font-semibold text-xs h-8 px-4"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isPending ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
