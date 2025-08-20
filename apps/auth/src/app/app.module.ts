import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TimeFlowDrizzleDbModule } from '@time-flow/drizzle-db';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig, refreshJwtConfig } from '@time-flow/shared-backend';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TimeFlowDrizzleDbModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
