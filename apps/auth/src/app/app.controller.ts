import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('validate-jwt-user')
  async validateJwtUser(@Payload() userId: number) {
    return await this.appService.validateJwtUser(userId);
  }

  @MessagePattern('validate-refresh-token')
  async validateRefreshToken(@Payload() userId: number) {
    return await this.appService.validateRefreshToken(userId);
  }
}
