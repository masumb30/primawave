// lib/actions/resources.ts
"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { resourceSchema } from "@/lib/validators/resource";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

function fdToObject(fd: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) obj[k] = v;
  return obj;
}

function normalizeFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function createResourceAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  console.log("[resource] create:start");

  try {
    await requireAdmin();
  } catch {
    return { ok: false, code: "FORBIDDEN", message: "Admins only" };
  }

  const parsed = resourceSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    const fieldErrors = normalizeFieldErrors(parsed.error.issues as any);
    console.log("[resource] create:validation-error", fieldErrors);
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  try {
    const created = await prisma.resource.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        location: parsed.data.location ?? null,
        capacity: parsed.data.capacity ?? null,
        bookingMode: parsed.data.bookingMode,
        slotMinutes: parsed.data.slotMinutes ?? null,
        minMinutes: parsed.data.minMinutes ?? null,
        maxMinutes: parsed.data.maxMinutes ?? null,
        openTime: parsed.data.openTime ?? null,
        closeTime: parsed.data.closeTime ?? null,
        status: parsed.data.status,
      },
      select: { id: true },
    });

    revalidatePath("/resources");
    revalidatePath("/admin/resources");

    console.log("[resource] create:success", created.id);
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    console.error("[resource] create:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to create resource" };
  }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function updateResourceAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  console.log("[resource] update:start", id);

  try {
    await requireAdmin();
  } catch {
    return { ok: false, code: "FORBIDDEN", message: "Admins only" };
  }

  const parsed = resourceSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    const fieldErrors = normalizeFieldErrors(parsed.error.issues as any);
    console.log("[resource] update:validation-error", fieldErrors);
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  try {
    await prisma.resource.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        location: parsed.data.location ?? null,
        capacity: parsed.data.capacity ?? null,
        bookingMode: parsed.data.bookingMode,
        slotMinutes: parsed.data.slotMinutes ?? null,
        minMinutes: parsed.data.minMinutes ?? null,
        maxMinutes: parsed.data.maxMinutes ?? null,
        openTime: parsed.data.openTime ?? null,
        closeTime: parsed.data.closeTime ?? null,
        status: parsed.data.status,
      },
    });

    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
    revalidatePath("/admin/resources");
    revalidatePath(`/admin/resources/${id}/edit`);

    console.log("[resource] update:success", id);
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { ok: false, code: "NOT_FOUND", message: "Resource not found" };
    }
    console.error("[resource] update:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to update resource" };
  }
}

// ---------------------------------------------------------------------------
// STATUS CHANGE (soft delete / reactivate / set maintenance)
// ---------------------------------------------------------------------------
export async function setResourceStatusAction(
  id: string,
  status: "AVAILABLE" | "MAINTENANCE" | "INACTIVE",
): Promise<ActionResult> {
  console.log("[resource] status:start", id, status);

  try {
    await requireAdmin();
  } catch {
    return { ok: false, code: "FORBIDDEN", message: "Admins only" };
  }

  try {
    await prisma.resource.update({ where: { id }, data: { status } });

    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);
    revalidatePath("/admin/resources");

    console.log("[resource] status:success", id, status);
    return { ok: true };
  } catch (err) {
    console.error("[resource] status:error", err);
    return { ok: false, code: "INTERNAL", message: "Failed to update status" };
  }
}