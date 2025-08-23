interface RefreshUser {
  accessToken: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: RefreshUser;
  }
}
