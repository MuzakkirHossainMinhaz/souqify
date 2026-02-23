import 'dotenv/config';
import Redis from 'ioredis';

const client = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // stop after 3 retries
    return Math.min(times * 200, 2000);
  },
});

client.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

client.on('connect', () => {
  console.log('[Redis] Connected');
});

export const redis = {
  client,
  get: async (key: string) => {
    return await client.get(key);
  },
  set: async (key: string, value: string, ex: number) => {
    return await client.set(key, value, 'EX', ex);
  },
  del: async (key: string) => {
    await client.del(key);
  },
  delMultiple: async (keys: string[]) => {
    await client.del(keys);
  },
};
