"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { ImageIcon } from "lucide-react";
import Heading from "@/components/heading";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/user-avatar";
import BotAvatar from "@/components/bot-avatar";
import { useState } from "react";

const ImagePage = () => {
  const router = useRouter();
  const [Images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values);
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);

      const urls = response.data.map((image: { url: string }) => {
        image.url;
      });
      setImages(urls);
      form.reset();
    } catch (error) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };
  console.log(form.formState.errors); // Check for validation errors

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into Image"
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="text-pink-700/10"
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
                        placeholder="How do i calculate the radius of circle"
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="col-span-12 lg:col-span-2 w-full "
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-20 ">
              <Loader />
            </div>
          )}
          {Images.length === 0 && !isLoading && (
            <Empty label="No images generated" />
          )}
          Images will be rendered here
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
