import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';
import * as compression from 'compression';
import { ErrorFilter } from './filters/error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedUrls = [process.env.FRONT_URL];

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Api Tareas')
      .setDescription('Api de tareas')
      .setVersion(packageJson.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    origin: allowedUrls,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,skip,*',
    preflightContinue: false,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());

  app.use(compression())

  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
