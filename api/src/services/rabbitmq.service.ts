import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { rabbitMQConfig } from 'src/config/rabbit.conf';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
    private client: ClientProxy;

    constructor(private readonly configService: ConfigService) {
        this.client = ClientProxyFactory.create(rabbitMQConfig(this.configService));
    }

    async sendMessage(pattern: string, data: any) {
        return firstValueFrom(this.client.send(pattern, data));
    }

    async publishMessage(pattern: string, data: any) {
        return firstValueFrom(this.client.emit(pattern, data));
    }

    onModuleDestroy() {
        this.client.close();
    }
}
