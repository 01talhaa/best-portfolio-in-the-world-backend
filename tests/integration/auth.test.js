const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { User } = require('../../src/models');

describe('Authentication Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'Client'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'Client'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    test('should reject registration with short password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123', // Too short
        role: 'Client'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });

    test('should reject registration with invalid role', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'InvalidRole'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('role');
    });

    test('should reject registration with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'Client'
      };

      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    test('should reject registration with missing required fields', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123'
        // Missing name and role
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let userEmail = 'logintest@example.com';
    let userPassword = 'password123';

    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test User',
          email: userEmail,
          password: userPassword,
          role: 'Client'
        });
    });

    test('should login user with valid credentials', async () => {
      const loginData = {
        email: userEmail,
        password: userPassword
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userEmail);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should reject login with wrong password', async () => {
      const loginData = {
        email: userEmail,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: userPassword
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: userPassword
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    test('should reject login with missing credentials', async () => {
      const loginData = {
        email: userEmail
        // Missing password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'Profile Test User',
        email: 'profile@example.com',
        password: 'password123',
        role: 'Admin'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      authToken = response.body.token;
      userId = response.body.data.user._id;
    });

    test('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.email).toBe('profile@example.com');
      expect(response.body.data.name).toBe('Profile Test User');
      expect(response.body.data.role).toBe('Admin');
      expect(response.body.data.password).toBeUndefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid token');
    });

    test('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('PUT /api/v1/auth/update-profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'Update Test User',
        email: 'update@example.com',
        password: 'password123',
        role: 'Client'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      authToken = response.body.token;
      userId = response.body.data.user._id;
    });

    test('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/v1/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.password).toBeUndefined();

      // Verify update in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);
    });

    test('should reject update without authentication', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put('/api/v1/auth/update-profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    test('should reject update with invalid email', async () => {
      const updateData = {
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .put('/api/v1/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    test('should reject update with duplicate email', async () => {
      // Create another user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
          role: 'Client'
        });

      const updateData = {
        email: 'another@example.com' // Try to use existing email
      };

      const response = await request(app)
        .put('/api/v1/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    test('should allow partial updates', async () => {
      const updateData = {
        name: 'Only Name Updated'
        // Email not included
      };

      const response = await request(app)
        .put('/api/v1/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe('update@example.com'); // Original email preserved
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    let authToken;
    let currentPassword = 'password123';

    beforeEach(async () => {
      const userData = {
        name: 'Password Test User',
        email: 'password@example.com',
        password: currentPassword,
        role: 'Client'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      authToken = response.body.token;
    });

    test('should change password with valid current password', async () => {
      const passwordData = {
        currentPassword: currentPassword,
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password updated');

      // Verify new password works for login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'password@example.com',
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should reject password change with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Current password is incorrect');
    });

    test('should reject password change without authentication', async () => {
      const passwordData = {
        currentPassword: currentPassword,
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    test('should reject password change with short new password', async () => {
      const passwordData = {
        currentPassword: currentPassword,
        newPassword: '123' // Too short
      };

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });

    test('should reject password change with missing fields', async () => {
      const passwordData = {
        currentPassword: currentPassword
        // Missing newPassword
      };

      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Role-based access control', () => {
    let adminToken;
    let clientToken;

    beforeEach(async () => {
      // Create admin user
      const adminResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'Admin'
        });
      adminToken = adminResponse.body.token;

      // Create client user
      const clientResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Client User',
          email: 'client@example.com',
          password: 'password123',
          role: 'Client'
        });
      clientToken = clientResponse.body.token;
    });

    test('admin should be able to create services', async () => {
      const serviceData = {
        name: 'Admin Created Service',
        description: 'Service created by admin',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('client should not be able to create services', async () => {
      const serviceData = {
        name: 'Client Created Service',
        description: 'Service creation should fail',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(serviceData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('permission');
    });

    test('both admin and client should be able to view services', async () => {
      // Admin view
      const adminResponse = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminResponse.body.success).toBe(true);

      // Client view
      const clientResponse = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(clientResponse.body.success).toBe(true);
    });
  });
});