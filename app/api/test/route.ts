import { NextResponse } from "next/server";

// Mock endpoint to test the UI without real Instagram access
export async function GET() {
  const mockData = {
    type: "carousel",
    username: "natgeo",
    caption: "The Amazon rainforest at golden hour 🌿 — one of the most biodiverse places on Earth. Shot during our expedition in 2024. #nature #amazon #photography",
    postUrl: "https://www.instagram.com/p/MOCK123/",
    items: [
      {
        url: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800",
        type: "image",
        width: 800,
        height: 800,
        index: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        type: "image",
        width: 800,
        height: 800,
        index: 1,
      },
      {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        width: 1280,
        height: 720,
        index: 2,
      },
    ],
    thumbnail: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800",
  };

  return NextResponse.json(mockData);
}
