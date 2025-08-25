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
  const port = process.env.PORT_USER as string;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL as string],
        queue: 'user_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

  await microservice.listen();
  Logger.log(`🚀User microservice is listening`);
}

bootstrap();
