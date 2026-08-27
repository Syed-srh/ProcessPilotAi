import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';

export const BCRYPT_SALT_ROUNDS = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  canApprove?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  canApprove: boolean;
  createdAt: Date;
  lastLogin?: Date | null;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export class AuthService {
  /**
   * Hash password with bcrypt cost 12
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user
   */
  public static async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role = Role.OPERATOR, canApprove } = input;

    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const userRole = role in Role ? role : Role.OPERATOR;
    // Admins and Operators automatically get approval capability unless specified otherwise
    const userCanApprove = canApprove !== undefined ? canApprove : (userRole === Role.ADMIN || userRole === Role.OPERATOR);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
        canApprove: userCanApprove,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'OPERATOR' | 'VIEWER',
      canApprove: user.canApprove,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        canApprove: user.canApprove,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      token,
    };
  }

  /**
   * Login user with credentials
   */
  public static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as 'ADMIN' | 'OPERATOR' | 'VIEWER',
      canApprove: updatedUser.canApprove,
    });

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        canApprove: updatedUser.canApprove,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
      },
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  public static async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      canApprove: user.canApprove,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
}
