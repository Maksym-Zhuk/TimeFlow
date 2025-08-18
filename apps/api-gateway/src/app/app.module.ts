import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { FastifyRequest, FastifyReply } from 'fastify';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      introspection: true,
      debug: true,
      context: ({
        req,
        reply,
      }: {
        req: FastifyRequest;
        reply: FastifyReply;
      }) => ({
        req,
        reply,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
