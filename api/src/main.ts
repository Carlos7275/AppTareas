import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';
import * as compression from 'compression';
import { ErrorFilter } from './filters/error.filter';
import { MicroserviceOptions } from '@nestjs/microservices';
import { rabbitMQConfig } from './config/rabbit.conf';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedUrls = JSON.parse(process.env.FRONT_URL);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .addGlobalResponse({
        status: 429,
        description: 'Demasiados intentos al recurso',
      })
      .addGlobalResponse({
        status: 500,
        description: 'Error interno en el servidor',
      })
      .setTitle('TODOLIST API')
      .setDescription('Api de tareas')
      .setVersion(packageJson.version)
      .addBearerAuth({
        type: 'http',
        in: 'header',
        scheme: "bearer"
      })
      .build();


    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    origin: allowedUrls,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,skip',
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());

  app.use(compression())

  const configService = app.get(ConfigService);

  const microserviceOptions = rabbitMQConfig(configService);

  microserviceOptions.options = {
    ...microserviceOptions.options,
    prefetchCount: 5,
  };

  app.connectMicroservice<MicroserviceOptions>(microserviceOptions);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
