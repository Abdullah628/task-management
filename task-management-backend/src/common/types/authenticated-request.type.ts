import { Request } from 'express';
import { Role } from '../../auth/role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};