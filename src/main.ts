import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AfrikaMart API')
      .setDescription('AfrikaMart backend API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        { 
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token', 
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);         
    SwaggerModule.setup('docs-json', app, document, {   
      swaggerOptions: { docExpansion: 'none' },
    });
    console.log('Swagger available at /docs');
  }
 
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`AfrikaMart backend listening on http://localhost:${port}`);
  console.log('EMAIL_USER=', process.env.EMAIL_USER ? 'OK' : 'MISSING');
  console.log('EMAIL_HOST=', process.env.EMAIL_HOST);
  console.log(`Swagger available at http://localhost:${port}/api`);
}
bootstrap();