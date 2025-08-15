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
      .addGlobalResponse({
        status: 429,
        description: 'Demasiados intentos al recurso',
      })
      .addGlobalResponse({
        status: 500,
        description: 'Error interno en el servidor',
      })
      .setTitle('Api Tareas')
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
    allowedHeaders: 'Content-Type,Authorization,skip,*',
    preflightContinue: false,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());

  app.use(compression())

  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
