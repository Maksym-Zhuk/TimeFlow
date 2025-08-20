import { registerAs } from '@nestjs/config';

export const refreshJwtConfig = registerAs('refresh-jwt', () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET env variable is not set');
  }
  return {
    secret: process.env.JWT_REFRESH_SECRET,
    signOptions: {
      expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
    },
  };
});
