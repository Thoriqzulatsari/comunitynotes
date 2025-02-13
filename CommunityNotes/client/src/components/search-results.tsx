import { User, Post } from "@shared/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { Link } from "wouter";

interface SearchResultsProps {
  results: {
    posts?: Post[];
    users?: User[];
  };
  onSelect?: () => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  const { posts = [], users = [] } = results;

  if (!posts.length && !users.length) {
    return (
      <CommandEmpty>No results found.</CommandEmpty>
    );
  }

  return (
    <>
      {users.length > 0 && (
        <CommandGroup heading="Users">
          {users.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => {
                onSelect?.();
              }}
            >
              <Link href={`/profile/${user.id}`} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user.username}</span>
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {posts.length > 0 && (
        <CommandGroup heading="Posts">
          {posts.map((post) => (
            <CommandItem
              key={post.id}
              onSelect={() => {
                onSelect?.();
              }}
            >
              <div className="flex flex-col gap-1">
                <p className="line-clamp-1">{post.content}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistance(new Date(post.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
