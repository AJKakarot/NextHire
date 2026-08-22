import { handleApiError, json } from "@/lib/server/http";
import { cloudinaryPublicId, resumeDownloadUrl } from "@/lib/server/upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const src = new URL(request.url).searchParams.get("url") || "";

    if (!src.includes("res.cloudinary.com")) {
      return json({ message: "Invalid resume URL" }, 400);
    }

    const publicId = cloudinaryPublicId(src);
    if (!publicId) {
      return json({ message: "Could not parse resume URL" }, 400);
    }

    const fileRes = await fetch(resumeDownloadUrl(publicId));
    if (!fileRes.ok) {
      return json({ message: "Could not fetch resume from storage" }, 502);
    }

    const buf = Buffer.from(await fileRes.arrayBuffer());
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
