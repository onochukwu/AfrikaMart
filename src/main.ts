import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors();

  
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

 
  app.useGlobalFilters(new AllExceptionsFilter());

 
  app.useGlobalInterceptors(new LoggingInterceptor());

  
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AfrikaMart API')
      .setDescription('AfrikaMart e-commerce backend API documentation')
      .setVersion('1.0')
      .addTag('Auth', 'Authentication & authorisation')
      .addTag('Products', 'Product catalogue management')
      .addTag('Categories', 'Product categories')
      .addTag('Brands', 'Product brands')
      .addTag('Cart', 'Shopping cart')
      .addTag('Orders', 'Order checkout & management')
      .addTag('Suppliers', 'Supplier management')
      .addTag('Inventory', 'Stock & inventory management')
      .addTag('Admin', 'Admin dashboard & analytics')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger UI available at /docs');
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  logger.log(`AfrikaMart backend listening on http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
