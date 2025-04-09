import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { PasswordService } from '@shared/services/password.service';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { Logger } from '@nestjs/common';

export async function seedAdminUser(userRepo: Repository<User>) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    Logger.log('[Seeder] Admin already exists. Skipping seeding.');
    return;
  }

  const passwordService = new PasswordService();

  const hashedPassword = await passwordService.hashPassword(adminPassword);

  const admin = userRepo.create({
    email: adminEmail,
    password: hashedPassword,
    role: AuthTypeEnum.ADMIN,
  });

  await userRepo.save(admin);
  Logger.log('[Seeder] Admin user seeded successfully.');
}

