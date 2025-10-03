const jwt = require('jsonwebtoken');
const { protect, restrictTo, checkPermission } = require('../../../src/middleware/auth');
const { User } = require('../../src/models');

// Mock the User model
jest.mock('../../../src/models', () => ({
  User: {
    findById: jest.fn()
  }
}));

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    test('should authenticate user with valid token', async () => {
      const userId = 'user-id';
      const token = 'valid-token';
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        role: 'User',
        isActive: true
      };

      req.headers.authorization = `Bearer ${token}`;
      
      jwt.verify.mockReturnValue({ id: userId });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'test-secret');
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should reject request without authorization header', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request for non-existent user', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;
      
      jwt.verify.mockReturnValue({ id: 'non-existent-user' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found or inactive.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request for inactive user', async () => {
      const userId = 'user-id';
      const token = 'valid-token';
      const inactiveUser = {
        _id: userId,
        email: 'test@example.com',
        role: 'User',
        isActive: false
      };

      req.headers.authorization = `Bearer ${token}`;
      
      jwt.verify.mockReturnValue({ id: userId });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(inactiveUser)
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found or inactive.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle expired token', async () => {
      req.headers.authorization = 'Bearer expired-token';
      
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Token expired.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('restrictTo middleware', () => {
    test('should allow user with correct role', () => {
      req.user = { role: 'Admin' };
      
      const middleware = restrictTo('Admin', 'Manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow user with one of multiple roles', () => {
      req.user = { role: 'Manager' };
      
      const middleware = restrictTo('Admin', 'Manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject user with incorrect role', () => {
      req.user = { role: 'User' };
      
      const middleware = restrictTo('Admin', 'Manager');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject when user is not defined', () => {
      req.user = null;
      
      const middleware = restrictTo('Admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission middleware', () => {
    beforeEach(() => {
      // Mock user permissions structure
      req.user = {
        role: 'Editor',
        permissions: {
          services: ['read', 'create', 'update'],
          projects: ['read', 'create']
        }
      };
    });

    test('should allow user with specific permission', () => {
      const middleware = checkPermission('services', 'create');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow Admin role for any permission', () => {
      req.user.role = 'Admin';
      
      const middleware = checkPermission('projects', 'delete');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject user without specific permission', () => {
      const middleware = checkPermission('services', 'delete');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. You do not have permission to delete services.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject user without resource permissions', () => {
      const middleware = checkPermission('users', 'read');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. You do not have permission to read users.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user without permissions object', () => {
      req.user = { role: 'User' }; // No permissions property
      
      const middleware = checkPermission('services', 'read');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. You do not have permission to read services.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    test('should handle database errors in protect middleware', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;
      
      jwt.verify.mockReturnValue({ id: 'user-id' });
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication error.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle malformed JWT tokens', async () => {
      req.headers.authorization = 'Bearer malformed.token';
      
      const malformedError = new Error('Malformed token');
      malformedError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});