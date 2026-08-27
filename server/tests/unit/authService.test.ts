import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService, BCRYPT_SALT_ROUNDS } from '../../src/services/authService';
import { generateToken, verifyToken } from '../../src/utils/jwt';
import { requireRole, requireApprovalPermission, AuthenticatedRequest } from '../../src/middleware/authMiddleware';
import { Role } from '@prisma/client';
import { Response, NextFunction } from 'express';

// Mock Prisma client
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/config/prisma';

describe('AuthService & Authorization Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing & Cost', () => {
    it('should hash passwords using bcrypt with cost 12', async () => {
      const password = 'SecretPassword123!';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);

      // Extract salt rounds from bcrypt hash string format: $2a$12$... or $2b$12$...
      const match = hash.match(/^\$2[abxy]\$(\d+)\$/);
      expect(match).not.toBeNull();
      if (match) {
        expect(parseInt(match[1], 10)).toBe(BCRYPT_SALT_ROUNDS);
      }

      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid passwords', async () => {
      const password = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Generation and Verification', () => {
    it('should generate and correctly verify a valid JWT token', () => {
      const payload = {
        userId: 'user-uuid-123',
        email: 'operator@processpilot.ai',
        role: 'OPERATOR' as const,
        canApprove: false,
      };

      const token = generateToken(payload);
      expect(token).toBeTypeOf('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.canApprove).toBe(payload.canApprove);
    });
  });

  describe('Role-Based Authorization Middlewares', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {};
      mockNext = vi.fn();
    });

    it('should allow ADMIN role when ADMIN is permitted', () => {
      mockReq.user = { userId: '1', email: 'admin@test.com', role: 'ADMIN', canApprove: true };
      const middleware = requireRole(Role.ADMIN, Role.OPERATOR);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny VIEWER role when only ADMIN and OPERATOR are permitted', () => {
      mockReq.user = { userId: '2', email: 'viewer@test.com', role: 'VIEWER', canApprove: false };
      const middleware = requireRole(Role.ADMIN, Role.OPERATOR);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should allow approval permission for ADMIN users', () => {
      mockReq.user = { userId: '1', email: 'admin@test.com', role: 'ADMIN', canApprove: true };

      requireApprovalPermission(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow approval permission for OPERATOR users with canApprove=true', () => {
      mockReq.user = { userId: '3', email: 'approver@test.com', role: 'OPERATOR', canApprove: true };

      requireApprovalPermission(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny approval permission for VIEWER users with canApprove=false', () => {
      mockReq.user = { userId: '4', email: 'viewer@test.com', role: 'VIEWER', canApprove: false };

      requireApprovalPermission(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  describe('AuthService Registration & Login', () => {
    it('should register a new user successfully', async () => {
      const mockCreatedUser = {
        id: 'new-user-123',
        name: 'Test Operator',
        email: 'test@processpilot.ai',
        passwordHash: '$2b$12$hashedpassword',
        role: Role.OPERATOR,
        canApprove: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockCreatedUser);

      const result = await AuthService.register({
        name: 'Test Operator',
        email: 'test@processpilot.ai',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@processpilot.ai');
      expect(result.user.role).toBe(Role.OPERATOR);
      expect(result.token).toBeDefined();
    });

    it('should throw ConflictError if registering existing email', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing-id' });

      await expect(
        AuthService.register({
          name: 'Test Operator',
          email: 'existing@processpilot.ai',
          password: 'password123',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });
});
