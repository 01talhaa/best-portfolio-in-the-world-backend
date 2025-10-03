// Simple test to verify Jest setup
describe('Jest Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Test environment is set correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('JWT secret is available', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  test('Global test utilities are available', () => {
    expect(global.createTestUser).toBeDefined();
    expect(global.generateAuthToken).toBeDefined();
    expect(global.createTestService).toBeDefined();
  });

  test('Can create test user data', () => {
    const user = global.createTestUser();
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('Admin');
  });

  test('Can generate auth token', () => {
    const user = global.createTestUser();
    const token = global.generateAuthToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});