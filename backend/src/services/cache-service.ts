// Cache abstraction supporting Redis and falling back to in-memory

export class CacheService {
  private memoryCache = new Map<string, { value: any, expiresAt: number }>();
  private redisClient: any = null;
  private isRedisConnected = false;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    console.log('Redis disabled on Vercel to prevent hanging. Using in-memory cache.');
    return;

    try {
      // Lazy load redis only if URL is provided
      // If redis is not installed or available, it falls back gracefully
      const { createClient } = await import('redis');
      this.redisClient = createClient({ url: redisUrl });
      
      this.redisClient.on('error', (err: any) => {
        console.warn('Redis connection error. Falling back to in-memory cache.', err.message);
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully.');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();
    } catch (e: any) {
      console.warn('Failed to initialize Redis. Falling back to in-memory cache.', e.message);
      this.isRedisConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.warn(`Redis GET error for key ${key}. Falling back to memory.`, e);
      }
    }

    // Memory Fallback
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 30): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, stringValue);
        return;
      } catch (e) {
        console.warn(`Redis SET error for key ${key}. Falling back to memory.`, e);
      }
    }

    // Memory Fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }
}
