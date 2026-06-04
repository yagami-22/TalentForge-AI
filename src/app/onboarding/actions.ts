"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function saveUserRole(formData: FormData) {
  const role = formData.get("role");

  if (role !== UserRole.CANDIDATE && role !== UserRole.RECRUITER) {
    throw new Error("Invalid onboarding role.");
  }

  const user = await getCurrentDbUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { role },
  });

  redirect("/dashboard");
}
