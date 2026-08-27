import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

// Mock Prisma client for integration testing
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

describe('Auth Flow Integration Test (register -> login -> /auth/me)', () => {
  const testUser = {
    id: 'user-integration-999',
    name: 'Fullstack Engineer',
    email: 'engineer@processpilot.ai',
    password: 'SecurePassword123!',
    passwordHash: '',
    role: Role.ADMIN,
    canApprove: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    testUser.passwordHash = await bcrypt.hash(testUser.password, 12);
  });

  it('should successfully complete full authentication lifecycle', async () => {
    // 1. Register
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      ...testUser,
      lastLogin: null,
    });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.user.email).toBe(testUser.email);
    expect(registerRes.body.data.token).toBeDefined();

    const registerToken = registerRes.body.data.token;

    // 2. Login
    (prisma.user.findUnique as any).mockResolvedValue(testUser);
    (prisma.user.update as any).mockResolvedValue({
      ...testUser,
      lastLogin: new Date(),
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();

    const loginToken = loginRes.body.data.token;

    // 3. GET /api/auth/me with valid Bearer token
    (prisma.user.findUnique as any).mockResolvedValue(testUser);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.id).toBe(testUser.id);
    expect(meRes.body.data.user.email).toBe(testUser.email);
    expect(meRes.body.data.user.role).toBe(Role.ADMIN);
    expect(meRes.body.data.user.canApprove).toBe(true);

    // 4. GET /api/auth/me without token -> should fail with 401
    const unauthenticatedRes = await request(app).get('/api/auth/me');
    expect(unauthenticatedRes.status).toBe(401);
    expect(unauthenticatedRes.body.success).toBe(false);
  });
});
