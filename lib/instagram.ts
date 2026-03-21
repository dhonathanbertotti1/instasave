import axios from "axios";
import qs from "qs";
import { MediaData, MediaItem, MediaType } from "@/types/media";

const INSTAGRAM_DOCUMENT_ID = "9510064595728286";
const BASE_URL = "https://www.instagram.com/graphql/query";

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

function buildCookieHeader(sessionId: string, csrfToken: string): string {
  return `sessionid=${sessionId}; csrftoken=${csrfToken}`;
}

async function instagramRequest(shortcode: string): Promise<Record<string, unknown>> {
  const sessionId = process.env.INSTAGRAM_SESSION_ID;
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN;

  if (!sessionId || !csrfToken) {
    throw new Error("Instagram session cookies not configured.");
  }

  const dataBody = qs.stringify({
    variables: JSON.stringify({
      shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null,
    }),
    doc_id: INSTAGRAM_DOCUMENT_ID,
  });

  const { data } = await axios.post(BASE_URL, dataBody, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": csrfToken,
      Cookie: buildCookieHeader(sessionId, csrfToken),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
      "X-IG-App-ID": "936619743392459",
    },
  });

  const media = (data?.data as Record<string, unknown>)?.xdt_shortcode_media;
  if (!media) {
    throw new Error("Only posts/reels supported, check if your link is valid.");
  }

  return media as Record<string, unknown>;
}

interface MediaDetail {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
}

function formatMediaDetails(node: Record<string, unknown>): MediaDetail {
  if (node.is_video) {
    return {
      type: "video",
      dimensions: node.dimensions as { width: number; height: number },
      url: node.video_url as string,
      thumbnail: node.display_url as string,
    };
  }
  return {
    type: "image",
    dimensions: node.dimensions as { width: number; height: number },
    url: node.display_url as string,
  };
}

function parseResult(requestData: Record<string, unknown>) {
  const isSidecar = requestData.__typename === "XDTGraphSidecar";
  const url_list: string[] = [];
  const media_details: MediaDetail[] = [];

  if (isSidecar) {
    const edges = (
      requestData.edge_sidecar_to_children as { edges: { node: Record<string, unknown> }[] }
    ).edges;
    for (const { node } of edges) {
      media_details.push(formatMediaDetails(node));
      url_list.push(node.is_video ? (node.video_url as string) : (node.display_url as string));
    }
  } else {
    media_details.push(formatMediaDetails(requestData));
    url_list.push(
      requestData.is_video ? (requestData.video_url as string) : (requestData.display_url as string)
    );
  }

  const captionEdges = (
    requestData.edge_media_to_caption as { edges: { node: { text: string } }[] }
  )?.edges ?? [];

  return {
    url_list,
    media_details,
    post_info: {
      owner_username: (requestData.owner as Record<string, string>)?.username ?? "instagram_user",
      caption: captionEdges[0]?.node?.text ?? "",
      is_private: (requestData.owner as Record<string, boolean>)?.is_private ?? false,
    },
  };
}

export async function fetchInstagramMedia(postUrl: string): Promise<MediaData> {
  const shortcode = extractShortcode(postUrl);
  if (!shortcode) {
    throw new Error(
      "URL inválida. Por favor, insira um link válido de post, reel ou story do Instagram."
    );
  }

  try {
    const raw = await instagramRequest(shortcode);
    const result = parseResult(raw);

    if (!result.url_list.length) {
      throw new Error("Nenhuma mídia encontrada neste post.");
    }

    const items: MediaItem[] = result.url_list.map((url, index) => {
      const detail = result.media_details[index];
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
      username: result.post_info.owner_username,
      caption: result.post_info.caption,
      items,
      postUrl,
      thumbnail: items[0]?.type === "image" ? items[0].url : items[0]?.thumbnail,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    if (message.includes("Only posts/reels supported") || message.includes("check if your link is valid")) {
      throw new Error("Tipo de link não suportado. Use um link direto de post ou reel.");
    }
    if (message.includes("private")) {
      throw new Error("Esta conta é privada. Apenas posts públicos podem ser baixados.");
    }
    if (message.includes("cookies not configured")) {
      throw new Error("Cookies de sessão do Instagram não configurados no servidor.");
    }

    throw new Error(`Não foi possível buscar a mídia: ${message}`);
  }
}
