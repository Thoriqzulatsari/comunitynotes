import { Post, Comment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface PostCardProps {
  post: Post;
  comments?: Comment[];
}

export function PostCard({ post, comments = [] }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if the current user has liked this post
  const { data: hasLiked } = useQuery({
    queryKey: [`/api/posts/${post.id}/liked`],
    enabled: !!user,
  });

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to like posts",
      });
      return;
    }

    try {
      await apiRequest(
        "POST",
        `/api/posts/${post.id}/${hasLiked ? "unlike" : "like"}`
      );

      // Invalidate both the posts list and the liked status
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/liked`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {post.userId.toString().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">User #{post.userId}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistance(new Date(post.createdAt!), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <p className="mb-4">{post.content}</p>

        {post.mediaUrl && (
          <div className="relative aspect-[4/3] mb-4">
            {post.mediaType === "photo" ? (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="object-cover rounded-lg w-full h-full"
              />
            ) : (
              <video
                src={post.mediaUrl}
                controls
                className="object-cover rounded-lg w-full h-full"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            {post.likes ?? 0}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-5 w-5" />
            {comments.length}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}