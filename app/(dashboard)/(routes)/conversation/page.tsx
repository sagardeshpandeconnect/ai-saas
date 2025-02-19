"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatCompletionMessage } from "openai/resources/chat";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import Heading from "@/components/heading";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Empty from "@/components/empty";
import Loader from "@/components/loader";

const ConversationPage = () => {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatCompletionMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values);
    try {
      const userMessage = {
        role: "user",
        content: values.prompt,
      } as const;
      const newMessages = [...messages, userMessage];
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });
      setMessages((current) => [...current, userMessage, response.data]);
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
        title="Conversation"
        description="Our most advanced conversation model"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="text-violet-500/10"
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
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length == 0 && !isLoading && (
            <div>
              <Empty label="No Conversation found" />
            </div>
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message) => {
              return <div key={message.content}>{message.content}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
