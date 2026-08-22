import { NextResponse } from "next/server";
import { ApiError } from "./errors";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }

  console.error(error);
  const message =
    error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ message }, { status: 500 });
}

export async function readJson<T = Record<string, unknown>>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

export async function parseForm(request: Request) {
  const form = await request.formData();
  const fields: Record<string, string> = {};
  let file: File | null = null;

  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      if (value.size > 0) file = value;
    } else {
      fields[key] = String(value);
    }
  }

  return { fields, file };
}

export async function fileToDataUri(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export function appUrl(request: Request) {
  const configured = (
    process.env.APP_URL ||
    process.env.Frontend_Url ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  )
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

  if (configured) return configured;
  return new URL(request.url).origin;
}
