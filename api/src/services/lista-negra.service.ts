import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ListaNegraService {
    private localBlacklistFile = path.join(__dirname, '..', 'storage', 'listaNegra-local.json');


    constructor(private redisService: RedisService) {
        const dir = path.dirname(this.localBlacklistFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async add(token: string) {

        const status = this.redisService.redis.status;
        if (status == "ready")
            await this.redisService.pushToList('blacklists', token);

        await this.saveTokenLocally(token);

    }

    async isBlacklisted(token: string): Promise<boolean> {
        try {
            return await this.redisService.searchInList('blacklists', token);
        } catch (error) {
            console.error('Error al verificar el token en Redis. Verificando localmente...');

            const localTokens = await this.getLocalBlacklist();

            return localTokens.includes(token);
        }
    }

    private async saveTokenLocally(token: string) {
        let tokens = await this.getLocalBlacklist();

        tokens.push(token);

        fs.writeFileSync(this.localBlacklistFile, JSON.stringify(tokens));
    }

    private async getLocalBlacklist(): Promise<string[]> {
        try {
            const data = fs.readFileSync(this.localBlacklistFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async syncLocalBlacklistWithRedis() {
        try {
            const localTokens = await this.getLocalBlacklist();

            for (const token of localTokens) {
                await this.redisService.pushToList('blacklists', token);
            }

            fs.writeFileSync(this.localBlacklistFile, JSON.stringify([]));
            console.log('Sincronización completada con éxito');
        } catch (error) {
            console.error('Error al sincronizar con Redis', error);
        }
    }
}
