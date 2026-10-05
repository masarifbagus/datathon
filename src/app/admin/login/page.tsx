import { Suspense } from "react";
import { AdminLoginClient } from "./admin-login-client";
import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login Administrator | LAN Datathon 2026",
  description: "Portal khusus administrator panitia LAN Datathon 2026",
};

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session && session.role === "admin") {
    redirect("/admin");
  }

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
          <AdminLoginClient />
        </Suspense>
      </main>
    </div>
  );
}
