import { Transport, RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const rabbitMQConfig = (configService: ConfigService): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get<string>('RABBITMQ_URL')],
    queue: configService.get<string>('RABBITMQ_QUEUE'),
    queueOptions: {
      durable: true,
    },
    persistent: true,
  },
});
