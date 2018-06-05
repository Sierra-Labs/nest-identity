import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@sierralabs/nest-utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const port = configService.get('http.port') || 3000;
  const isExplorer = configService.get('api.explorer');
  const explorerPath = configService.get('api.explorerPath') || 'api';
  const basePath = configService.get('api.basePath') || '';

  app.setGlobalPrefix(basePath);

  if (isExplorer) {
    const options = new DocumentBuilder()
      .setBasePath(basePath)
      .setTitle('Project')
      .setDescription('API Documentation')
      .setVersion('1.0')
      // .addTag('tag')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(explorerPath, app, document);
  }

  await app.listen(port);
}
bootstrap();
