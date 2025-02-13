import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "./media-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      mediaUrl: "",
      mediaType: null,
    },
  });

  const onSubmit = async (values: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/posts", values);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // In a real app, we would upload the file to a storage service
      // and get back a URL. For this demo, we'll create an object URL
      const mediaType = file.type.startsWith("image/") ? "photo" : "video";
      const mediaUrl = URL.createObjectURL(file);
      form.setValue("mediaUrl", mediaUrl);
      form.setValue("mediaType", mediaType);
    } else {
      form.setValue("mediaUrl", "");
      form.setValue("mediaType", null);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MediaUpload onFileSelect={handleFileSelect} />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
