import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PasswordService } from '@shared/services/password.service';
import { JWTAuthService } from '@shared/services/jwt-auth.service';
import { RegisterDto, LoginDto } from '../dto/index.dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let passwordService: PasswordService;
    let jwtAuthService: JWTAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            AuthService,
            {
              provide: UserService,
              useValue: {
                  checkExistenceByEmail: jest.fn(),
                  createUser: jest.fn(),
                  getUserBy: jest.fn(),
              },
            },
            {
              provide: PasswordService,
              useValue: {
                  hashPassword: jest.fn(),
                  compareHash: jest.fn(),
              },
            },
            {
              provide: JWTAuthService,
              useValue: {
                  generateToken: jest.fn(),
              },
            },
          ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        passwordService = module.get<PasswordService>(PasswordService);
        jwtAuthService = module.get<JWTAuthService>(JWTAuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };
            
            const hashedPassword = 'hashedPassword123';
            const newUser = {
              id: "550e8400-e29b-41d4-a716-446655440044",
              email: registerDto.email,
              password: hashedPassword,
            } as User;

            const userToCreate = {
              email: registerDto.email,
              password: hashedPassword,
            } as User;
            
            const token = 'generatedToken';
            
            jest.spyOn(userService, 'checkExistenceByEmail').mockResolvedValue(false);
            jest.spyOn(passwordService, 'hashPassword').mockResolvedValue(hashedPassword);
            jest.spyOn(userService, 'createUser').mockResolvedValue(newUser);
            jest.spyOn(jwtAuthService, 'generateToken').mockResolvedValue(token);
            
            const result = await authService.register(registerDto);
            
            expect(userService.checkExistenceByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(passwordService.hashPassword).toHaveBeenCalledWith(registerDto.password);
            expect(userService.createUser).toHaveBeenCalledWith(userToCreate);

            expect(jwtAuthService.generateToken).toHaveBeenCalledWith({
                email: newUser.email,
                role: newUser.role,
                id: newUser.id.toString(),
            });
            expect(result).toEqual({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                token,
            });
        });

        it('should throw UnprocessableEntityException if email already exists', async () => {
            const registerDto: RegisterDto = {
              email: 'test@example.com',
              password: 'Password123!',
            };
          
            jest.spyOn(userService, 'checkExistenceByEmail').mockResolvedValue(true);
          
            await expect(authService.register(registerDto)).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'Password123!',
            };
          
            const user = {
              id: "550e8400-e29b-41d4-a716-446655440044",
              email: loginDto.email,
              password: 'hashedPassword123',
              role: 'user',
            } as User;
          
            const token = 'generatedToken';
          
            jest.spyOn(userService, 'getUserBy').mockResolvedValue(user);
            jest.spyOn(passwordService, 'compareHash').mockResolvedValue(true);
            jest.spyOn(jwtAuthService, 'generateToken').mockResolvedValue(token);
          
            const result = await authService.login(loginDto);
          
            expect(userService.getUserBy).toHaveBeenCalledWith({ email: loginDto.email });
            expect(passwordService.compareHash).toHaveBeenCalledWith(loginDto.password, user.password);
            expect(jwtAuthService.generateToken).toHaveBeenCalledWith({
              email: user.email,
              role: user.role,
              id: user.id.toString(),
            });
            expect(result).toEqual({
              id: user.id,
              email: user.email,
              role: user.role,
              token,
            });
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'Password123!',
            };
          
            jest.spyOn(userService, 'getUserBy').mockResolvedValue(null);
          
            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'WrongPassword123!',
            };
          
            const user = {
              id: "550e8400-e29b-41d4-a716-446655440044",
              email: loginDto.email,
              password: 'hashedPassword123',
              role: 'user',
            } as User;
          
            jest.spyOn(userService, 'getUserBy').mockResolvedValue(user);
            jest.spyOn(passwordService, 'compareHash').mockResolvedValue(false);
          
            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
