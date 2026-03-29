import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validate, emailSchema, passwordSchema } from '../utils/validation';

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2).max(50).trim(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  // POST /api/v1/auth/register
  app.post('/register', async (request, reply) => {
    const body = validate(registerSchema, request.body);
    const result = await authService.register(body);

    // TODO: Send verification email via Resend
    app.log.info({ userId: result.userId }, 'User registered, verification token generated');

    reply.status(201).send({
      data: {
        message: 'Registration successful. Please check your email to verify your account.',
        userId: result.userId,
      },
    });
  });

  // POST /api/v1/auth/login
  app.post('/login', async (request, reply) => {
    const body = validate(loginSchema, request.body);
    const tokens = await authService.login({
      ...body,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({ data: tokens });
  });

  // POST /api/v1/auth/logout
  app.post('/logout', async (request, reply) => {
    const body = validate(refreshSchema, request.body);
    await authService.logout(body.refreshToken);
    reply.send({ data: { message: 'Logged out successfully' } });
  });

  // POST /api/v1/auth/refresh
  app.post('/refresh', async (request, reply) => {
    const body = validate(refreshSchema, request.body);
    const tokens = await authService.refresh(body.refreshToken);
    reply.send({ data: tokens });
  });

  // POST /api/v1/auth/verify-email
  app.post('/verify-email', async (request, reply) => {
    const body = validate(verifyEmailSchema, request.body);
    await authService.verifyEmail(body.token);
    reply.send({ data: { message: 'Email verified successfully' } });
  });

  // POST /api/v1/auth/forgot-password
  app.post('/forgot-password', async (request, reply) => {
    const body = validate(forgotPasswordSchema, request.body);
    const token = await authService.forgotPassword(body.email);

    if (token) {
      // TODO: Send password reset email via Resend
      app.log.info('Password reset token generated');
    }

    // Always return success to not reveal email existence
    reply.send({
      data: { message: 'If an account exists with that email, a reset link has been sent.' },
    });
  });

  // POST /api/v1/auth/reset-password
  app.post('/reset-password', async (request, reply) => {
    const body = validate(resetPasswordSchema, request.body);
    await authService.resetPassword(body.token, body.password);
    reply.send({ data: { message: 'Password reset successful' } });
  });

  // GET /api/v1/auth/me
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const profile = await authService.getProfile(request.user!.sub);
    reply.send({ data: profile });
  });
}
