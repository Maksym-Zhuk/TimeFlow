import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const port = process.env.PORT_AUTH!;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL as string],
        queue: 'auth_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

  await microservice.listen();
  Logger.log(`🚀Auth microservice is listening`);
}

bootstrap();
