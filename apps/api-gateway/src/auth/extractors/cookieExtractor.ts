import { FastifyRequest } from 'fastify';

export const cookieExtractor =
  (cookieName: string) =>
  (request: FastifyRequest): string | null => {
    if (request.cookies && request.cookies[cookieName]) {
      return request.cookies[cookieName];
    }
    return null;
  };
