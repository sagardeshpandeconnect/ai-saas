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
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          alpha: 0.5,
          prompt_a: prompt,
          prompt_b: "90's rap",
          denoising: 0.75,
          seed_image_id: "vibes",
          num_inference_steps: 50,
        },
      }
    );

    console.log("REPLICATE RESPONSE >>>", response);

    // Process the streams and convert them to base64 for easier handling on the client
    const processedResponse = await processReplicateStreams(response);

    return NextResponse.json(processedResponse);
  } catch (error) {
    console.log("(MUSIC_ERROR)", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Function to process both streams from Replicate
async function processReplicateStreams(response) {
  // Check if we have the expected stream format
  if (!response.audio || !response.spectrogram) {
    return response; // Return original response if not in expected format
  }

  try {
    // Process both audio and spectrogram streams
    const [audioData, spectrogramData] = await Promise.all([
      streamToBuffer(response.audio),
      streamToBuffer(response.spectrogram),
    ]);

    // Convert the buffers to base64 strings
    const audioBase64 = audioData.toString("base64");
    const spectrogramBase64 = spectrogramData.toString("base64");

    // Return processed data
    return {
      audio: {
        base64: audioBase64,
        contentType: "audio/wav", // Adjust based on actual format
      },
      spectrogram: {
        base64: spectrogramBase64,
        contentType: "image/png", // Adjust based on actual format
      },
      originalResponse: response, // Optional: include original response
    };
  } catch (error) {
    console.error("Error processing streams:", error);
    return response; // Fall back to original response on error
  }
}

// Helper function to convert ReadableStream to Buffer
// Define interfaces for stream handling
interface StreamChunk {
  done: boolean;
  value: Uint8Array;
}

interface StreamReader {
  read(): Promise<StreamChunk>;
  releaseLock(): void;
}

interface ReadableStreamWithReader extends ReadableStream {
  getReader(): StreamReader;
}

async function streamToBuffer(
  stream: ReadableStreamWithReader
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader: StreamReader = stream.getReader();

  try {
    while (true) {
      const { done, value }: StreamChunk = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}
