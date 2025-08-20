import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  validateRefreshToken(userId: number) {
    throw new Error('Method not implemented.');
  }
  validateJwtUser(userId: number) {
    throw new Error('Method not implemented.');
  }
}
