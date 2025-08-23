import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterInput, LoginInput } from '@time-flow/shared-backend';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('register-user')
  async register(@Payload() input: RegisterInput) {
    return await this.appService.register(input);
  }

  @MessagePattern('login-user')
  async login(@Payload() input: LoginInput) {
    return await this.appService.login(input);
  }

  @MessagePattern('validate-jwt-user')
  async validateJwtUser(@Payload() userId: string) {
    return await this.appService.validateJwtUser(userId);
  }

  @MessagePattern('validate-refresh-token')
  async validateRefreshToken(@Payload() userId: string) {
    return await this.appService.validateRefreshToken(userId);
  }
}
