import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggingModule } from '../logging/logging.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [LoggingModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
