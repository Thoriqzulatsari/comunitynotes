import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/search", async (req, res) => {
    const query = req.query.q?.toString().toLowerCase() || "";
    const type = req.query.type?.toString() || "all"; // "posts", "users", or "all"

    const results: { posts?: any[], users?: any[] } = {};

    if (type === "posts" || type === "all") {
      const posts = await storage.getPosts();
      results.posts = posts.filter(post => 
        post.content.toLowerCase().includes(query)
      );
    }

    if (type === "users" || type === "all") {
      const users = Array.from((await storage.getPosts())
        .reduce((set, post) => set.add(post.userId), new Set()))
        .map(async (userId) => {
          const user = await storage.getUser(userId as number);
          return user;
        });
      const resolvedUsers = await Promise.all(users);
      results.users = resolvedUsers.filter(user => 
        user?.username.toLowerCase().includes(query)
      );
    }

    res.json(results);
  });

  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validated = insertPostSchema.parse(req.body);
    const post = await storage.createPost({
      ...validated,
      userId: req.user.id,
    });
    res.json(post);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validated = insertCommentSchema.parse(req.body);
    const comment = await storage.createComment({
      ...validated,
      userId: req.user.id,
    });
    res.json(comment);
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getCommentsByPost(parseInt(req.params.postId));
    res.json(comments);
  });

  app.get("/api/posts/:postId/liked", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const like = await storage.getLike(req.user.id, parseInt(req.params.postId));
    res.json(!!like);
  });

  app.post("/api/posts/:postId/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.likePost(req.user.id, parseInt(req.params.postId));
    res.sendStatus(200);
  });

  app.post("/api/posts/:postId/unlike", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.unlikePost(req.user.id, parseInt(req.params.postId));
    res.sendStatus(200);
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    const posts = await storage.getPostsByUser(parseInt(req.params.userId));
    res.json(posts);
  });

  app.get("/api/users/:userId/likes", async (req, res) => {
    const likes = await storage.getLikesByUser(parseInt(req.params.userId));
    res.json(likes);
  });

  const httpServer = createServer(app);
  return httpServer;
}