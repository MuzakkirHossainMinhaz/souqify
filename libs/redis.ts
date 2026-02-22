import 'dotenv/config';
import Redis from 'ioredis';

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

export const redis = {
  client,
  get: async (key: string) => {
    return await client.get(key);
  },
  set: async (key: string, value: string, ex: number) => {
    return await client.set(key, value, 'EX', ex);
  },
};
