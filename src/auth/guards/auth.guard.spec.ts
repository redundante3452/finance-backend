import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const mockPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockContext('Bearer valid-token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should attach user to request on valid token', async () => {
      const mockPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockContext('Bearer valid-token');
      const request = context.switchToHttp().getRequest();

      await guard.canActivate(context);

      expect(request.user).toEqual({
        userId: mockPayload.userId,
        email: mockPayload.email,
      });
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const context = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when authorization header is empty', async () => {
      const context = createMockContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when token type is not Bearer', async () => {
      const context = createMockContext('Basic some-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const context = createMockContext('Bearer invalid-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
      const context = createMockContext('Bearer expired-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when token is malformed', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt malformed'));
      const context = createMockContext('Bearer malformed-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle Bearer with extra spaces', async () => {
      const context = createMockContext('Bearer  token-with-space');

      // The guard splits by space and takes second element
      // So 'Bearer  token' would split to ['Bearer', '', 'token-with-space']
      // and token would be ''
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle lowercase bearer', async () => {
      const context = createMockContext('bearer valid-token');

      // Bearer must be exact case match
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle token without Bearer prefix', async () => {
      const context = createMockContext('just-a-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle very long token', async () => {
      const longToken = 'a'.repeat(10000);
      const mockPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockContext(`Bearer ${longToken}`);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(longToken);
    });

    it('should handle token with special characters', async () => {
      const tokenWithSpecialChars =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const mockPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockContext(`Bearer ${tokenWithSpecialChars}`);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle null authorization header', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle undefined headers', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: undefined,
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow();
    });
  });

  describe('token extraction', () => {
    it('should correctly extract token from valid header', async () => {
      const expectedToken = 'my-jwt-token-123';
      const mockPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockContext(`Bearer ${expectedToken}`);

      await guard.canActivate(context);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(expectedToken);
    });

    it('should handle multiple spaces between Bearer and token', async () => {
      // This tests the implementation's behavior with malformed headers
      const context = createMockContext('Bearer    token');

      // Due to split(' '), this would result in empty token
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
