import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages } = body;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!openai.apiKey) {
      return NextResponse.json(
        { error: "OpenAI API Key not found" },
        { status: 500 }
      );
    }
    if (!messages) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const freeTrial = await checkApiLimit();

    if (!freeTrial) {
      return NextResponse.json(
        { error: "Free trial limit reached" },
        { status: 403 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      store: true,
      messages,
    });
    await increaseApiLimit();
    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("(conversation error)", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
