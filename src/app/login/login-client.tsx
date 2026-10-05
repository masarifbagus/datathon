"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginWithCredentialsAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, User, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const QUICK_JUDGE_USERNAMES = ["KemenpanRB", "KSP", "Tanoto Foundation", "LAN"];

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelectQuick = (u: string) => {
    setUsername(u);
    setPassword("juri123");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Silakan masukkan username juri.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginWithCredentialsAction({
          username: username.trim(),
          password: password.trim(),
          expectedRole: "judge",
        });

        if (res.success && res.redirectUrl) {
          toast.success(`Berhasil masuk sebagai ${username.toUpperCase()}`);
          const target = redirectUrl || res.redirectUrl;
          router.push(target);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal masuk.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kendala jaringan.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Header with Logos */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/logo-lan-dark.png"
            alt="LAN RI"
            width={95}
            height={36}
            className="h-8 w-auto object-contain dark:hidden"
            priority
          />
          <Image
            src="/logo-lan-putih.png"
            alt="LAN RI"
            width={95}
            height={36}
            className="h-8 w-auto object-contain hidden dark:block"
            priority
          />
          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
          <Image
            src="/logo-lan-datathon.png"
            alt="LAN Datathon 2026"
            width={130}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
          <Image
            src="/logo-tanoto.png"
            alt="Tanoto Foundation"
            width={95}
            height={36}
            className="h-6.5 w-auto object-contain rounded"
            priority
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Login Dewan Juri
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Masukkan username dan password panelis juri untuk menginput nilai.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span>Username Juri</span>
            </label>
            <input
              type="text"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: KemenpanRB, KSP, Tanoto Foundation, LAN"
              className="w-full py-2 px-3 text-sm font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Quick Choice Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-neutral-400 font-mono">Pilih cepat:</span>
            {QUICK_JUDGE_USERNAMES.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleSelectQuick(u)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  username.toLowerCase() === u.toLowerCase()
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 font-bold"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400"
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-neutral-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-2 px-3 text-sm font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
            <p className="text-[10px] text-neutral-400 font-mono">
              Password default: <span className="font-bold text-neutral-600 dark:text-neutral-300">juri123</span>
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full font-semibold text-sm h-10 mt-2 cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Masuk sebagai Juri</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Admin Portal Switcher */}
      <div className="text-center pt-2">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
          <span>Akses Administrator Panitia? Masuk ke Portal Admin &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
