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
import { VideoIcon } from "lucide-react";

const VideoPage = () => {
  const router = useRouter();

  const [videoUrl, setVideoUrl] = useState<string>();

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
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values);
    try {
      // Reset current video
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }

      setVideoUrl(undefined);

      const response = await axios.post("/api/video", values);
      console.log("API Response:", response.data);

      // Handle the response based on the format
      if (response.data.video?.base64) {
        // We got the processed response with base64
        const videoBlob = base64ToBlob(
          response.data.video.base64,
          response.data.video.contentType || "video/mp4"
        );
        const newVideoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(newVideoUrl);
      } else if (Array.isArray(response.data) && response.data[0]) {
        // Handle legacy response format (direct URL)
        setVideoUrl(response.data[0]);
      } else if (response.data.originalResponse) {
        // Handle any other format that might have the original response
        setVideoUrl(response.data.originalResponse);
      }

      form.reset();
    } catch (error) {
      console.log("Error generating video:", error);
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
        title="Video Generation"
        description="Turn your prompt into Video"
        icon={VideoIcon}
        iconColor="text-orange-700"
        bgColor="text-orange-700/10"
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
                        placeholder="Clown fish swimming around a coral reef"
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
          {!videoUrl && !isLoading && <Empty label="No Video generated" />}
          {videoUrl && (
            <video
              className="w-full aspect-video mt-8 rounded-lg border bg-black"
              controls
              autoPlay
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
