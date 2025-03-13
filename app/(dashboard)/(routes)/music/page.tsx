"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import Heading from "@/components/heading";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import { MusicIcon } from "lucide-react";

const MusicPage = () => {
  const router = useRouter();

  const [audioUrl, setAudioUrl] = useState<string>();
  const [spectrogramUrl, setSpectrogramUrl] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Cleanup function to release object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      if (spectrogramUrl && spectrogramUrl.startsWith("blob:")) {
        URL.revokeObjectURL(spectrogramUrl);
      }
    };
  }, [audioUrl, spectrogramUrl]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values);
    try {
      // Reset current media
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      if (spectrogramUrl && spectrogramUrl.startsWith("blob:")) {
        URL.revokeObjectURL(spectrogramUrl);
      }

      setAudioUrl(undefined);
      setSpectrogramUrl(undefined);

      const response = await axios.post("/api/music", values);
      console.log("API Response:", response.data);

      // Handle the response based on the format
      if (response.data.audio?.base64) {
        // We got the processed response with base64
        const audioBlob = base64ToBlob(
          response.data.audio.base64,
          response.data.audio.contentType || "audio/wav"
        );
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);

        // Handle spectrogram if available
        if (response.data.spectrogram?.base64) {
          const imageUrl = `data:${
            response.data.spectrogram.contentType || "image/png"
          };base64,${response.data.spectrogram.base64}`;
          setSpectrogramUrl(imageUrl);
        }
      } else if (response.data.audio instanceof ReadableStream) {
        // Handle legacy response format (direct stream)
        console.log("Got ReadableStream, converting...");
      } else {
        // Handle other response formats (e.g., direct URL)
        setAudioUrl(response.data.audio);
      }

      form.reset();
    } catch (error) {
      console.log("Error generating music:", error);
    } finally {
      router.refresh();
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);

      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  return (
    <div>
      <Heading
        title="Music Generation"
        description="Turn your prompt into Music"
        icon={MusicIcon}
        iconColor="text-emerald-500"
        bgColor="text-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              className="rounded-lg border w-full p-4 px-3 md:px-8 focus-within:shadow-sm grid grid-cols-12 gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className=" col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        disabled={isLoading}
                        placeholder="Piano solo"
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {!audioUrl && !isLoading && <Empty label="No Music generated" />}
          {audioUrl && (
            <div className="flex flex-col space-y-4">
              <audio controls className="w-full mt-8">
                <source src={audioUrl} />
              </audio>

              {spectrogramUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    Audio Spectrogram
                  </h3>
                  <div className="relative w-full h-48 bg-black/10 rounded-lg overflow-hidden">
                    {/* Using next/image for the spectrogram */}
                    <img
                      src={spectrogramUrl}
                      alt="Audio spectrogram"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
