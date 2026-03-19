import { MediaData, MediaItem, MediaType } from "@/types/media";

function extractShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/stories\/[^/]+\/([0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectMediaType(url: string): MediaType {
  if (url.includes("/reel/") || url.includes("/reels/")) return "reel";
  if (url.includes("/tv/")) return "igtv";
  if (url.includes("/stories/")) return "story";
  return "video";
}

interface MediaDetail {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
}

interface InstagramResult {
  results_number: number;
  url_list: string[];
  post_info: {
    owner_username: string;
    owner_fullname: string;
    caption: string;
    is_private: boolean;
  };
  media_details: MediaDetail[];
}

export async function fetchInstagramMedia(postUrl: string): Promise<MediaData> {
  const shortcode = extractShortcode(postUrl);
  if (!shortcode) {
    throw new Error(
      "Invalid Instagram URL. Please provide a valid Instagram post, reel, or story URL."
    );
  }

  try {
    const { instagramGetUrl } = await import("instagram-url-direct");
    const result = (await instagramGetUrl(postUrl)) as InstagramResult;

    if (!result || !result.url_list || result.url_list.length === 0) {
      throw new Error("No media found in this post.");
    }

    const items: MediaItem[] = result.url_list.map((url: string, index: number) => {
      const detail = result.media_details?.[index];
      const isVideo = detail?.type === "video" || url.includes(".mp4");
      return {
        url,
        type: isVideo ? "video" : "image",
        thumbnail: detail?.type === "video" ? detail.thumbnail : undefined,
        width: detail?.dimensions?.width,
        height: detail?.dimensions?.height,
        index,
      };
    });

    const hasVideo = items.some((i) => i.type === "video");
    const isCarousel = items.length > 1;

    let mediaType: MediaType = detectMediaType(postUrl);
    if (isCarousel) mediaType = "carousel";
    else if (!hasVideo) mediaType = "image";

    return {
      type: mediaType,
      username: result.post_info?.owner_username || "instagram_user",
      caption: result.post_info?.caption,
      items,
      postUrl,
      thumbnail: items[0]?.type === "image" ? items[0].url : items[0]?.thumbnail,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (
      message.includes("Only posts/reels supported") ||
      message.includes("check if your link is valid")
    ) {
      throw new Error(
        "This link type is not supported. Please use a direct post, reel, or IGTV link."
      );
    }

    if (message.includes("private")) {
      throw new Error("This account is private. Only public posts can be downloaded.");
    }

    throw new Error(
      `Unable to fetch media: ${message}. The post may be private or temporarily unavailable.`
    );
  }
}
