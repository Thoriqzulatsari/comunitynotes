import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Command,
  CommandDialog,
  CommandInput,
} from "@/components/ui/command";
import { SearchResults } from "../search-results";
import { useQuery } from "@tanstack/react-query";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/videos", label: "Videos" },
  { href: "/photos", label: "Photos" },
  { href: "/comments", label: "Comments" },
];

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["/api/search", search],
    enabled: search.length > 0,
  });

  return (
    <nav className="border-b">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex gap-8 items-center flex-1">
            <div className="flex gap-6">
              {LINKS.map(({ href, label }) => (
                <Link 
                  key={href} 
                  href={href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search 
                  className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" 
                  onClick={() => setOpen(true)}
                />
                <Button
                  variant="outline"
                  className="w-full justify-start pl-8 text-muted-foreground"
                  onClick={() => setOpen(true)}
                >
                  Search posts and users...
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link href="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search posts and users..."
            value={search}
            onValueChange={setSearch}
          />
          <SearchResults 
            results={searchResults || { posts: [], users: [] }}
            onSelect={() => setOpen(false)}
          />
        </Command>
      </CommandDialog>
    </nav>
  );
}