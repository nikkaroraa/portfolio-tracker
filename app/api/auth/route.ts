import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    const correctPassword = process.env.CRYPTO_TRACKER_PASSWORD;
    
    if (!correctPassword) {
      console.error("CRYPTO_TRACKER_PASSWORD environment variable not set");
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 500 }
      );
    }
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}