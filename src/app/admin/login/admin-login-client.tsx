"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginWithCredentialsAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ShieldCheck, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Silakan masukkan username admin.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginWithCredentialsAction({
          username: username.trim(),
          password: password.trim(),
          expectedRole: "admin",
        });

        if (res.success && res.redirectUrl) {
          toast.success("Berhasil masuk sebagai Administrator");
          const target = redirectUrl || res.redirectUrl;
          router.push(target);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal masuk administrator.");
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
            className="h-6.5 w-auto object-contain"
            priority
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-medium text-neutral-500 mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Portal Khusus Administrator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Login Administrator
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Akses dashboard rekapitulasi nilai real-time & ekspor Excel.
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
              <span>Username Administrator</span>
            </label>
            <input
              type="text"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full py-2 px-3 text-sm font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
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
              Password default: <span className="font-bold text-neutral-600 dark:text-neutral-300">admin123</span>
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full font-semibold text-sm h-10 mt-2 cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Masuk Dashboard Admin</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Back to Judge Portal Switcher */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-neutral-400" />
          <span>Bukan Admin? Kembali ke Portal Dewan Juri</span>
        </Link>
      </div>
    </div>
  );
}
