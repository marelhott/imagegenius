import { type User, type InsertUser, type Generation, type InsertGeneration } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGeneration(id: string): Promise<Generation | undefined>;
  updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private generations: Map<string, Generation>;

  constructor() {
    this.users = new Map();
    this.generations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const id = randomUUID();
    const generation: Generation = { 
      ...insertGeneration, 
      id,
      status: insertGeneration.status || 'pending',
      createdAt: new Date().toISOString()
    };
    this.generations.set(id, generation);
    return generation;
  }

  async getGeneration(id: string): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation | undefined> {
    const generation = this.generations.get(id);
    if (!generation) {
      return undefined;
    }
    
    const updatedGeneration = { ...generation, ...updates };
    this.generations.set(id, updatedGeneration);
    return updatedGeneration;
  }
}

export const storage = new MemStorage();
