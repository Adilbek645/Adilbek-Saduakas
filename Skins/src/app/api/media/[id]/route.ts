import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mediaId = Number.parseInt(id, 10);
  if (!Number.isFinite(mediaId)) {
    return new Response("Bad request", { status: 400 });
  }
  const rows = await db.select().from(media).where(eq(media.id, mediaId)).limit(1);
  const file = rows[0];
  if (!file) return new Response("Not found", { status: 404 });

  const buffer = Buffer.from(file.data, "base64");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
