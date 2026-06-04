import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function getCurrentDbUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user is missing a primary email.");
  }

  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ clerkId: clerkUser.id }, { email }],
    },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        clerkId: clerkUser.id,
        email,
        name: name || clerkUser.username,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name: name || clerkUser.username,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
