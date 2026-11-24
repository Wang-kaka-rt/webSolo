import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/backend/auth/adminAuth";
import { CategoryInputError, createCategory } from "@/backend/services/categoryService";
export const runtime = "nodejs";
export async function POST(request: Request) { const cookiesStore = await cookies(); if (!verifyAdminSession(cookiesStore.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { return NextResponse.json({ category: await createCategory(await request.json()) }, { status: 201 }); } catch (error) { if (error instanceof CategoryInputError) return NextResponse.json({ error: error.message }, { status: 400 }); if (error instanceof Error && /duplicate/i.test(error.message)) return NextResponse.json({ error: "该分类标识已存在。" }, { status: 409 }); return NextResponse.json({ error: "无法新增分类。" }, { status: 500 }); } }
