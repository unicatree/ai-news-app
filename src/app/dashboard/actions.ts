"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";

const RESERVED = ["전체", "기타"];
const MAX_LENGTH = 20;

export type AddCategoryResult = { error?: string };

export async function addCategory(formData: FormData): Promise<AddCategoryResult> {
  const { userId } = await auth.protect();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "카테고리 이름을 입력해 주세요." };
  if (name.length > MAX_LENGTH) return { error: `${MAX_LENGTH}자 이내로 입력해 주세요.` };
  if (RESERVED.includes(name)) return { error: "이미 있는 카테고리입니다." };

  const inserted = await db
    .insert(categories)
    .values({ userId, name })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id });
  if (inserted.length === 0) return { error: "이미 있는 카테고리입니다." };

  revalidatePath("/dashboard");
  return {};
}
