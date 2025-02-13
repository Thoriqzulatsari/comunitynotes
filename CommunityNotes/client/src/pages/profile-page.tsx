import { useQuery } from "@tanstack/react-query";
import { Post, Like } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PostCard } from "@/components/post-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: userPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: [`/api/users/${user?.id}/posts`],
    enabled: !!user,
  });

  const { data: userLikes, isLoading: likesLoading } = useQuery<Like[]>({
    queryKey: [`/api/users/${user?.id}/likes`],
    enabled: !!user,
  });

  if (postsLoading || likesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {user?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-muted-foreground">
              Joined {new Date(user?.createdAt!).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="space-y-6">
            {userPosts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="space-y-6">
            {userLikes?.map((like) => (
              <PostCard
                key={like.id}
                post={{
                  id: like.postId,
                  userId: user!.id,
                  content: "",
                  likes: 0,
                  createdAt: like.createdAt,
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
