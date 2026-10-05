"use server";

import { createSession, destroySession, getSession } from "@/lib/auth";
import { getUserByUsername } from "@/lib/scoring-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
