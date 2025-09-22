/**
 * In-memory storage service for sessions and cache
 * 
 * @description Temporary storage for MVP (replace with DB in production)
 * Used in: Session management and caching across API endpoints
 * 
 * @tags storage, cache, session, in-memory
 */

import type { Session, QuestionSet } from '@story-doctor/core';

/**
 * In-memory storage collections
 * 
 * @description Maps for storing sessions and question sets
 * Used in: Storage service methods
 * 
 * @tags storage, maps, collections
 */
const sessions = new Map<string, Session>();
const questionSets = new Map<string, QuestionSet>();

// Cache expiry time (30 minutes)
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CachedItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Session storage service
 * 
 * @description CRUD operations for sessions
 * Used in: API endpoints for session management
 * 
 * @tags session, crud, storage
 */
export const sessionStorage = {
  /**
   * Store a session
   */
  set(session: Session): void {
    sessions.set(session.id, session);
    
    // Clean up old sessions (simple memory management)
    if (sessions.size > 1000) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey) {
        sessions.delete(oldestKey);
      }
    }
  },

  /**
   * Retrieve a session by ID
   */
  get(id: string): Session | undefined {
    return sessions.get(id);
  },

  /**
   * Update a session
   */
  update(id: string, updates: Partial<Session>): Session | undefined {
    const existing = sessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    sessions.set(id, updated);
    return updated;
  },

  /**
   * Delete a session
   */
  delete(id: string): boolean {
    return sessions.delete(id);
  },

  /**
   * Get all sessions (for debugging)
   */
  getAll(): Session[] {
    return Array.from(sessions.values());
  },

  /**
   * Clear all sessions
   */
  clear(): void {
    sessions.clear();
  },
};

/**
 * Question set storage service
 * 
 * @description CRUD operations for question sets with caching
 * Used in: API endpoints for question management
 * 
 * @tags questions, crud, storage, cache
 */
export const questionSetStorage = {
  /**
   * Store a question set
   */
  set(questionSet: QuestionSet): void {
    questionSets.set(questionSet.id, questionSet);
    
    // Clean up old question sets
    if (questionSets.size > 500) {
      const oldestKey = questionSets.keys().next().value;
      if (oldestKey) {
        questionSets.delete(oldestKey);
      }
    }
  },

  /**
   * Retrieve a question set by ID
   */
  get(id: string): QuestionSet | undefined {
    return questionSets.get(id);
  },

  /**
   * Get question set by work ID (returns most recent)
   */
  getByWorkId(workId: string): QuestionSet | undefined {
    const sets = Array.from(questionSets.values())
      .filter(qs => qs.workId === workId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return sets[0];
  },

  /**
   * Delete a question set
   */
  delete(id: string): boolean {
    return questionSets.delete(id);
  },

  /**
   * Clear all question sets
   */
  clear(): void {
    questionSets.clear();
  },
};

/**
 * Generic cache service
 * 
 * @description TTL-based caching for any data type
 * Used in: Caching LLM responses and computed results
 * 
 * @tags cache, ttl, generic
 */
export const cache = {
  storage: new Map<string, CachedItem<any>>(),

  /**
   * Store an item in cache
   */
  set<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now() + ttlMs,
    });
  },

  /**
   * Retrieve an item from cache
   */
  get<T>(key: string): T | undefined {
    const item = this.storage.get(key);
    
    if (!item) return undefined;
    
    // Check if expired
    if (Date.now() > item.timestamp) {
      this.storage.delete(key);
      return undefined;
    }
    
    return item.data as T;
  },

  /**
   * Delete an item from cache
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  },

  /**
   * Clear all cache
   */
  clear(): void {
    this.storage.clear();
  },

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (now > item.timestamp) {
        this.storage.delete(key);
      }
    }
  },
};

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);