import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  // Enable CORS
  const frontendUrl = process.env.FRONTEND_URL;
  let origin: boolean | string | RegExp | (string | RegExp)[] = '*';

  if (process.env.NODE_ENV === 'production' && frontendUrl) {
    if (frontendUrl === '*') {
      origin = '*';
    } else {
      origin = frontendUrl.split(',').map(url => url.trim());
    }
  }

  app.enableCors({
    origin: origin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Finance API')
    .setDescription('API para gestión de finanzas personales')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
