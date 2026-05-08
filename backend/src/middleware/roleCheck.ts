import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

export const isSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Forbidden: Only Super Admin can perform this action' });
    return;
  }

  next();
};

export const isAdminOrHigher = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const adminRoles = ['super_admin', 'admin'];
  if (!adminRoles.includes(req.user.role)) {
    res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    return;
  }

  next();
};

export const canManageProducts = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const allowedRoles = ['super_admin', 'admin', 'product_manager'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({ error: 'Forbidden: Cannot manage products' });
    return;
  }

  next();
};
