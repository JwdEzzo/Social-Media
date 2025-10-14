// components/CreatePostModal.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useCreatePostMutation } from "@/api/posts/postApi";
import type { CreatePostRequestDto } from "@/types/requestTypes";
import { useEffect } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const postSchema = z.object({
  description: z.string().min(0, "Description is required"),
  imageUrl: z.string().min(5, "Image URL is required"),
});

type PostSchema = z.infer<typeof postSchema>;

function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      description: "",
      imageUrl: "",
    },
  });

  async function handleFormSubmit(data: PostSchema) {
    try {
      const postRequest: CreatePostRequestDto = {
        description: data.description,
        imageUrl: data.imageUrl,
      };

      await createPost(postRequest).unwrap();
      form.reset();
      onClose();
    } catch (error: any) {
      console.error("Failed to create post:", error);
    }
  }

  // Generate random sentences
  const getRandomSentence = () => {
    const sentences = [
      "Just another beautiful day!",
      "Living my best life.",
      "Creating memories that last forever.",
      "Chasing dreams and catching stars.",
      "Life is an adventure, embrace it!",
      "Making today count.",
      "Happiness is found in simple moments.",
      "Grateful for this amazing journey.",
      "Capturing the essence of joy.",
      "Every moment is a fresh beginning.",
      "Finding beauty in unexpected places.",
      "Creating my own sunshine.",
      "Life is too short for boring moments.",
      "Exploring the world one step at a time.",
      "In pursuit of happiness and good vibes.",
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  useEffect(() => {
    if (isOpen) {
      const randomNumber = Math.floor(Math.random() * 1000);
      form.setValue(
        "imageUrl",
        `https://picsum.photos/1080/1920?random=${randomNumber}`
      );
      form.setValue("description", getRandomSentence());
    }
  }, [isOpen, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Preview */}
              {form.watch("imageUrl") && (
                <div className="mt-2">
                  <img
                    src={form.watch("imageUrl")}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a caption..."
                        {...field}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Random description button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    form.setValue("description", getRandomSentence())
                  }
                  disabled={isSubmitting}
                >
                  Random Description
                </Button>
              </div>

              {/* Error message for form-level errors */}
              {form.formState.errors.root && (
                <FormMessage>{form.formState.errors.root.message}</FormMessage>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Post"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePostModal;
