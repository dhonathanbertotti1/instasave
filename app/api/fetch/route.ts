import { NextRequest, NextResponse } from "next/server";
import { fetchInstagramMedia } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl.includes("instagram.com")) {
      return NextResponse.json(
        { error: "Please enter a valid Instagram URL" },
        { status: 400 }
      );
    }

    const mediaData = await fetchInstagramMedia(trimmedUrl);
    return NextResponse.json(mediaData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
