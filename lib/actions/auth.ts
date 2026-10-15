// lib/actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; code: string; message: string };

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export async function registerAction(formData: FormData): Promise<ActionResult> {
  console.log("[auth] register:start");

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    console.log("[auth] register:validation-error", message);
    return { ok: false, code: "VALIDATION", message };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("[auth] register:email-exists", email);
      return { ok: false, code: "EMAIL_EXISTS", message: "That email is already registered" };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
      select: { id: true, email: true, role: true },
    });

    await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
    revalidatePath("/", "layout");

    console.log("[auth] register:success", user.id);
    return { ok: true };
  } catch (err) {
    console.error("[auth] register:error", err);
    return { ok: false, code: "INTERNAL", message: "Something went wrong. Try again." };
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function loginAction(formData: FormData): Promise<ActionResult> {
  console.log("[auth] login:start");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    console.log("[auth] login:validation-error", message);
    return { ok: false, code: "VALIDATION", message };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Deliberately do not reveal whether the email exists.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      console.log("[auth] login:invalid-credentials", email);
      return { ok: false, code: "INVALID_CREDENTIALS", message: "Invalid email or password" };
    }

    await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
    revalidatePath("/", "layout");

    console.log("[auth] login:success", user.id);
    return { ok: true };
  } catch (err) {
    console.error("[auth] login:error", err);
    return { ok: false, code: "INTERNAL", message: "Something went wrong. Try again." };
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function logoutAction(): Promise<ActionResult> {
  console.log("[auth] logout:start");
  try {
    await clearSessionCookie();
    revalidatePath("/", "layout");
    console.log("[auth] logout:success");
    return { ok: true };
  } catch (err) {
    console.error("[auth] logout:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to log out" };
  }
}