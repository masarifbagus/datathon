"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quickLoginAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const QUICK_JUDGES = [
  { id: "juri1", name: "Juri 1", role: "judge", desc: "Dewan Juri Panel 1" },
  { id: "juri2", name: "Juri 2", role: "judge", desc: "Dewan Juri Panel 2" },
  { id: "juri3", name: "Juri 3", role: "judge", desc: "Dewan Juri Panel 3" },
  { id: "juri4", name: "Juri 4", role: "judge", desc: "Dewan Juri Panel 4" },
];

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickLogin = (username: string) => {
    setSelectedUser(username);
    startTransition(async () => {
      try {
        const res = await quickLoginAction(username);
        if (res.success && res.redirectUrl) {
          toast.success(`Berhasil login sebagai ${username.toUpperCase()}`);
          const target = redirectUrl || res.redirectUrl;
          router.push(target);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal masuk.");
          setSelectedUser(null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan koneksi.");
        setSelectedUser(null);
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
          Demo Day LAN Datathon 2026
        </p>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Portal Penjurian
        </h1>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto">
          Silakan pilih akun Juri atau Administrator untuk melanjutkan ke sesi penilaian.
        </p>
      </div>

      <div className="space-y-4">
        {/* Judges Section */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Dewan Juri (4 Panelis)
            </h2>
            <p className="text-xs text-neutral-400">
              Pilih identitas juri Anda untuk menginput skor tim
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_JUDGES.map((judge) => {
              const isSelected = selectedUser === judge.id && isPending;
              return (
                <button
                  key={judge.id}
                  disabled={isPending}
                  onClick={() => handleQuickLogin(judge.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono text-xs font-bold">
                      {judge.name.split(" ")[1]}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                        {judge.name}
                      </p>
                      <p className="text-xs text-neutral-400">{judge.desc}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Administrator Section */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 space-y-3 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Administrator Panitia
            </h2>
            <p className="text-xs text-neutral-400">
              Akses live matrix leaderboard dan fitur ekspor Excel (.xlsx)
            </p>
          </div>

          <button
            disabled={isPending}
            onClick={() => handleQuickLogin("admin")}
            className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedUser === "admin" && isPending
                ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800"
                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono text-xs font-bold">
                A
              </span>
              <div>
                <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                  Administrator
                </p>
                <p className="text-xs text-neutral-400">
                  Dashboard Rekapitulasi Real-Time & Download Excel
                </p>
              </div>
            </div>

            {selectedUser === "admin" && isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
            ) : (
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
