import { registerAs } from '@nestjs/config';

interface JwtConfig {
  secret: string;
  singOptions: {
    expiresIn?: string;
  };
}

export const jwtConfig = registerAs('jwt', (): JwtConfig => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env variable is not set');
  }

  return {
    secret: process.env.JWT_SECRET,
    singOptions: {
      expiresIn: process.env.JWT_EXPIRE_IN,
    },
  };
});
