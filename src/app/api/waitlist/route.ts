import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Simple email validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    let waitlist: { email: string; timestamp: string }[] = [];

    // Read existing file if it exists
    try {
      const data = await fs.readFile(WAITLIST_FILE, "utf-8");
      waitlist = JSON.parse(data);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      // If file doesn't exist, we start with empty array
      if (err.code !== "ENOENT") {
        console.error("Error reading waitlist file:", err);
      }
    }

    // Check duplicate
    if (waitlist.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { message: "You are already on the waitlist! We will be in touch soon." },
        { status: 200 }
      );
    }

    // Add new email
    waitlist.push({
      email,
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2), "utf-8");

    return NextResponse.json(
      { message: "Successfully joined the waitlist! Welcome to the crew." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
