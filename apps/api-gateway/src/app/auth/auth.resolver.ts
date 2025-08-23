import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInput, RegisterInput } from '@time-flow/shared-backend';
import { authResponse, refreshResponse } from '@time-flow/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlRefreshJwtGuard } from '../../guards/gqlRefreshJwt.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private sendCookies(
    accessToken: string,
    refreshToken: string,
    context: { reply: FastifyReply }
  ) {
    context.reply.setCookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60,
      secure: false,
    });

    context.reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      secure: false,
    });
  }

  @Mutation(() => authResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: { reply: FastifyReply }
  ) {
    const { accessToken, refreshToken } =
      await this.authService.register(input);

    this.sendCookies(accessToken, refreshToken, context);

    return {
      message: 'Registration successful!',
    };
  }

  @Mutation(() => authResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: { reply: FastifyReply }
  ) {
    const { accessToken, refreshToken } = await this.authService.login(input);

    this.sendCookies(accessToken, refreshToken, context);

    return {
      message: 'Login successful!',
    };
  }

  @UseGuards(GqlRefreshJwtGuard)
  @Mutation(() => refreshResponse)
  refreshToken(
    @Context() context: { reply: FastifyReply; req: FastifyRequest }
  ) {
    const user = context.req.user;
    if (!user || !user.accessToken) {
      throw new UnauthorizedException('User not found in request');
    }

    return user;
  }

  @Query(() => String)
  logout(@Context() context: { reply: FastifyReply }) {
    context.reply.clearCookie('accessToken', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    context.reply.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    return 'Logout done';
  }
}
