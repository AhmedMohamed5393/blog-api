import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: 'uuid-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'Editor',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            isExist: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  describe('checkExistenceByEmail', () => {
    it('should return true if email exists', async () => {
      userRepository.isExist.mockResolvedValue(true);

      const result = await service.checkExistenceByEmail('test@example.com');

      expect(result).toBe(true);
      expect(userRepository.isExist).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('getUserBy', () => {
    it('should return user by given where clause', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserBy({ email: 'test@example.com' });

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true, email: true, password: true, role: true },
      });
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});

