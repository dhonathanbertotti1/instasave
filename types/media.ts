export type MediaType = "video" | "image" | "carousel" | "story" | "reel" | "igtv";

export interface MediaItem {
  url: string;
  type: "video" | "image";
  thumbnail?: string;
  width?: number;
  height?: number;
  index?: number;
}

export interface MediaData {
  type: MediaType;
  username: string;
  caption?: string;
  thumbnail?: string;
  items: MediaItem[];
  postUrl: string;
}
