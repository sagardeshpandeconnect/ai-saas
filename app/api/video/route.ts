import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await replicate.run(
      "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
      {
        input: {
          fps: 24,
          model: "xl",
          width: 1024,
          height: 576,
          prompt: prompt,
          batch_size: 1,
          num_frames: 24,
          init_weight: 0.5,
          guidance_scale: 17.5,
          negative_prompt:
            "very blue, dust, noisy, washed out, ugly, distorted, broken",
          remove_watermark: false,
          num_inference_steps: 50,
        },
      }
    );

    console.log("REPLICATE RESPONSE >>>", response);

    // Process the video stream
    const processedResponse = await processVideoStream(response);

    return NextResponse.json(processedResponse);
  } catch (error) {
    console.log("(VIDEO_ERROR)", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Function to process video stream from Replicate
async function processVideoStream(response: any) {
  // Check if response is an array containing a ReadableStream
  if (
    !Array.isArray(response) ||
    !response[0] ||
    !(response[0] instanceof ReadableStream)
  ) {
    return response; // Return original response if not in expected format
  }

  try {
    // Process the video stream (first item in the array)
    const videoData = await streamToBuffer(response[0]);

    // Convert the buffer to base64 string
    const videoBase64 = videoData.toString("base64");

    // Return processed data
    return {
      video: {
        base64: videoBase64,
        contentType: "video/mp4", // Assuming MP4 format, adjust if needed
      },
      originalResponse: response[0], // Optional: include original response
    };
  } catch (error) {
    console.error("Error processing video stream:", error);
    return response; // Fall back to original response on error
  }
}

// Helper function to convert ReadableStream to Buffer
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock(); // Important to release the reader
  }

  // Combine chunks into a single Buffer
  return Buffer.concat(chunks);
}
