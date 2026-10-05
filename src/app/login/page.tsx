import { Suspense } from "react";
import { LoginClient } from "./login-client";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Login Juri & Admin | LAN Datathon 2026",
  description: "Portal masuk penjurian dan dashboard rekapitulasi Demo Day LAN Datathon 2026",
};

export default async function LoginPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar session={session} />
      <main className="flex-1 flex items-center justify-center py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <LoginClient />
        </Suspense>
      </main>
    </div>
  );
}
