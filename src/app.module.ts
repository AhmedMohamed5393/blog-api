import { Module } from '@nestjs/common'; 
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './modules/logging/logging.module';
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LoggingModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
