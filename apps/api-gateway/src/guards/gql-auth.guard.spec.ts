import { Test, TestingModule } from '@nestjs/testing';
import { GqlAuthGuard } from './gql-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GqlAuthGuard],
    }).compile();

    guard = module.get<GqlAuthGuard>(GqlAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should extract request object from GraphQL context', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer fake-token',
        },
      } as FastifyRequest;

      const mockExecutionContext: ExecutionContext = {
        getType: () => 'graphql',
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        getArgs: () => [{}, {}, { req: mockRequest }, {}],
      } as any;

      const gqlContext = GqlExecutionContext.create(mockExecutionContext);

      jest
        .spyOn(gqlContext, 'getContext')
        .mockReturnValue({ req: mockRequest });

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toBe(mockRequest);
      expect(result.headers.authorization).toBe('Bearer fake-token');
    });
  });
});
