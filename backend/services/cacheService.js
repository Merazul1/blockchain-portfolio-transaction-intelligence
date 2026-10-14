const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.isRedisConnected = false;
    this.memoryCache = new Map(); // key -> { value, expiresAt }
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times) => {
          if (times > 2) {
            return null; // Stop retrying Redis, fallback gracefully
          }
          return Math.min(times * 1000, 3000);
        },
        lazyConnect: true,
      });

      this.redisClient.connect().then(() => {
        this.isRedisConnected = true;
        console.log('[Cache] Connected to Redis instance:', redisUrl);
      }).catch((err) => {
        this.isRedisConnected = false;
        console.log('[Cache] Redis not available (' + err.message + '). Active fallback: High-performance In-Memory TTL Cache.');
      });

      this.redisClient.on('error', () => {
        this.isRedisConnected = false;
      });
    } catch (e) {
      this.isRedisConnected = false;
      console.log('[Cache] Initialized In-Memory TTL Cache fallback.');
    }

    // Background interval to clean up expired memory cache entries
    setInterval(() => this.cleanupMemoryCache(), 60000).unref();
  }

  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && item.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  async get(key) {
    if (this.isRedisConnected) {
      try {
        const val = await this.redisClient.get(key);
        if (val !== null) {
          this.stats.hits++;
          return JSON.parse(val);
        }
      } catch (err) {
        // Fall through to memory cache if redis read fails
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  async set(key, value, ttlSeconds = 120) {
    this.stats.sets++;
    if (this.isRedisConnected) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
      } catch (err) {
        // Fall back to memory cache
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null,
    });
    return true;
  }

  async del(key) {
    if (this.isRedisConnected) {
      try {
        await this.redisClient.del(key);
      } catch (e) {}
    }
    this.memoryCache.delete(key);
  }

  getStatus() {
    return {
      engine: this.isRedisConnected ? 'Redis (Connected)' : 'In-Memory Cache (Redis Ready)',
      isRedis: this.isRedisConnected,
      memoryKeysCount: this.memoryCache.size,
      stats: this.stats,
    };
  }
}

module.exports = new CacheService();
