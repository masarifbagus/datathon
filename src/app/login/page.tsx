import { Suspense } from "react";
import { LoginClient } from "./login-client";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Login Dewan Juri | LAN Datathon 2026",
  description: "Portal masuk dewan juri LAN Datathon 2026",
};

export default async function LoginPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900">
      <Navbar session={session} />
      <main className="flex-1 flex items-center justify-center py-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
            </div>
          }
        >
          <LoginClient />
        </Suspense>
      </main>
    </div>
  );
}
