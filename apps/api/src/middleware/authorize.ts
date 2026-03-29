import type { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { Role } from '@nexusbot/shared';

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(request.user.role as Role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

export function requireTenant() {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError();
    }
    if (!request.user.tenantId) {
      throw new ForbiddenError('No tenant associated with this account');
    }
  };
}
