import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: true,
      introspection: true,
      graphiql: true,
      debug: true,
      context: (request: FastifyRequest, reply: FastifyReply) => ({
        req: request,
        reply,
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
