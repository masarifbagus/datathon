"use server";

import { createSession, destroySession, getSession } from "@/lib/auth";
import { getUserByUsername } from "@/lib/scoring-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginWithCredentialsAction(params: {
  username: string;
  password?: string;
  expectedRole?: "judge" | "admin";
}) {
  const cleanUsername = params.username.trim().toLowerCase();
  const password = params.password?.trim() || "";

  if (!cleanUsername) {
    return { success: false, error: "Username wajib diisi." };
  }

  const user = await getUserByUsername(cleanUsername);
  if (!user) {
    return {
      success: false,
      error: `Username "${params.username}" tidak terdaftar dalam sistem.`,
    };
  }

  // Validate expected role if specified
  if (params.expectedRole === "judge" && user.role !== "judge") {
    return {
      success: false,
      error: "Akun ini adalah Administrator. Silakan masuk melalui Portal Admin di /admin/login.",
    };
  }

  if (params.expectedRole === "admin" && user.role !== "admin") {
    return {
      success: false,
      error: "Akun ini bukan Administrator. Silakan masuk melalui Portal Juri di /login.",
    };
  }

  // Password verification
  if (user.role === "admin") {
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (password && password !== adminPass) {
      return { success: false, error: "Password administrator salah (Default: admin123)." };
    }
  } else {
    const judgePass = process.env.JUDGE_PASSWORD || "juri123";
    if (password && password !== judgePass && password !== cleanUsername) {
      return { success: false, error: "Password juri salah (Default: juri123)." };
    }
  }

  await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatar: user.avatar || undefined,
  });

  const targetPath = user.role === "admin" ? "/admin" : "/judge";
  revalidatePath("/", "layout");
  return { success: true, redirectUrl: targetPath };
}

export async function quickLoginAction(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return { success: false, error: `Pengguna dengan username "${username}" tidak ditemukan.` };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatar: user.avatar || undefined,
  });

  const targetPath = user.role === "admin" ? "/admin" : "/judge";
  revalidatePath("/", "layout");
  return { success: true, redirectUrl: targetPath };
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUserAction() {
  return await getSession();
}
