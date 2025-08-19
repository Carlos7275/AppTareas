import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() public readonly redis: Redis) {
    this.redis.on('error', () => {
      Logger.warn('Redis no disponible. Intentando reconectar...');
    });
    this.redis.on('connect', () => {
      Logger.log('Conectado a Redis.');
    });
    this.redis.on('reconnecting', () => {
      Logger.warn('Reconectando a Redis...');
    });
  }

  private isConnected(): boolean {
    return this.redis.status === 'ready';
  }

  async setValue(key: string, value: string): Promise<string | null> {
    if (!this.isConnected()) return null;
    return this.redis.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    if (!this.isConnected()) return null;
    return this.redis.get(key);
  }

  async deleteValue(key: string): Promise<number | null> {
    if (!this.isConnected()) return null;
    return this.redis.del(key);
  }

  async pushToList(key: string, value: string): Promise<number | null> {
    if (!this.isConnected()) return null;
    return this.redis.rpush(key, value);
  }

  async getListRange(key: string, start: number, end: number): Promise<string[]> {
    if (!this.isConnected()) return [];
    return this.redis.lrange(key, start, end);
  }

  async getListElementAtIndex(key: string, index: number): Promise<string | null> {
    if (!this.isConnected()) return null;
    return this.redis.lindex(key, index);
  }

  async searchInList(key: string, value: string): Promise<boolean> {
    if (!this.isConnected()) return false;
    const list = await this.redis.lrange(key, 0, -1);
    return list.includes(value);
  }
}
