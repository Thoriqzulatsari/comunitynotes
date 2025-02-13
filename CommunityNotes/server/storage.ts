import { User, InsertUser, Post, Comment, Like, users, posts, comments, likes } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPost(post: Omit<Post, "id" | "likes" | "createdAt">): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;

  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;

  getLike(userId: number, postId: number): Promise<Like | undefined>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  getLikesByUser(userId: number): Promise<Like[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createPost(post: Omit<Post, "id" | "likes" | "createdAt">): Promise<Post> {
    const [newPost] = await db.insert(posts).values({
      ...post,
      likes: 0,
    }).returning();
    return newPost;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(posts.createdAt);
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.userId, userId));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId));
  }

  async getLike(userId: number, postId: number): Promise<Like | undefined> {
    const [like] = await db.select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return like;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Insert the like
      await tx.insert(likes).values({ userId, postId });

      // Increment the likes count using SQL
      await tx
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId));
    });
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Delete the like
      await tx
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

      // Decrement the likes count using SQL
      await tx
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId));
    });
  }

  async getLikesByUser(userId: number): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.userId, userId));
  }
}

export const storage = new DatabaseStorage();