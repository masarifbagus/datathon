"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LogOut, Trophy, Award, ShieldCheck, UserCheck } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

interface NavbarProps {
  session: SessionPayload | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-sm">
            L
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white tracking-tight text-sm sm:text-base">
              LAN DATATHON
            </span>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
              2026
            </Badge>
          </div>
        </Link>

        {/* User Navigation */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                  {session.name}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  {session.role === "admin" ? "Admin" : "Juri"}
                </span>
              </div>

              {session.role === "judge" && (
                <Link href="/judge">
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Lembar Nilai
                  </Button>
                </Link>
              )}

              {session.role === "admin" && (
                <Link href="/admin">
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Dashboard Rekap
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isPending}
                className="text-xs text-neutral-500 hover:text-neutral-900 h-8 px-2.5"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                <span>{isPending ? "..." : "Keluar"}</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="default" className="text-xs h-8 font-medium">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
