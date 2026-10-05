"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand with Official Logos */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Logo LAN RI */}
            <Image
              src="/logo-lan-dark.png"
              alt="LAN RI"
              width={90}
              height={32}
              className="h-6 sm:h-7 w-auto object-contain"
              priority
            />

            <div className="h-4 w-px bg-neutral-200" />

            {/* Logo LAN Datathon */}
            <Image
              src="/logo-lan-datathon.png"
              alt="LAN Datathon 2026"
              width={140}
              height={36}
              className="h-6 sm:h-7.5 w-auto object-contain"
              priority
            />

            <div className="h-4 w-px bg-neutral-200" />

            {/* Logo Tanoto Foundation */}
            <Image
              src="/logo-tanoto.png"
              alt="Tanoto Foundation"
              width={85}
              height={32}
              className="h-5 sm:h-6 w-auto object-contain rounded"
              priority
            />
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

              {/* {session.role === "judge" && (
                <Link href="/judge">
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Lembar Nilai
                  </Button>
                </Link>
              )} */}

              {/* {session.role === "admin" && (
                <Link href="/admin">
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Dashboard Rekap
                  </Button>
                </Link>
              )} */}

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
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="default" className="text-xs h-8 font-medium">
                  Masuk Juri
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="sm" variant="outline" className="text-xs h-8 font-medium text-neutral-600 dark:text-neutral-400">
                  Admin
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
