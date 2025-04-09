import { Global, Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from '../../../db/database.config';
import { JWTAuthService } from './services/jwt-auth.service';
import { PasswordService } from './services/password.service';
import { seedAdminUser } from '../../../db/seeds/user.seeder';
import { Blog } from '../blog/entities/blog.entity';
import { BlogRepository } from '../blog/repositories/blog.repository';
import { User } from '../user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRE_IN');
        return {
          secret: jwtSecret,
          signOptions: { expiresIn },
        };
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Blog, User]),
  ],
  exports: [
    JWTAuthService,
    PasswordService,
    BlogRepository,
    UserRepository,
  ],
  providers: [
    JWTAuthService,
    JwtService,
    PasswordService,
    BlogRepository,
    UserRepository,
  ],
})
export class SharedModule implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const userRepo = this.dataSource.getRepository(User);
    await seedAdminUser(userRepo);
  }
}
