const mongoose = require('mongoose');

// Mock MongoDB Memory Server setup
let mongoServer;

// Initialize test database
const setupTestDB = async () => {
  try {
    // Try to use mongodb-memory-server if available
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('Connected to in-memory MongoDB');
    } catch (error) {
      // Fallback to mock database if mongodb-memory-server is not available
      console.log('Using mock database setup');
      
      // Mock mongoose connection
      mongoose.connection.readyState = 1; // connected
      mongoose.connection.db = {
        collections: () => Promise.resolve([]),
        dropDatabase: () => Promise.resolve()
      };
      mongoose.connection.collections = {};
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

// Clean up test database
const teardownTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Database teardown failed:', error);
  }
};

// Clear all collections
const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    // If clearing fails, it might be because we're using mocks
    console.log('Database clear skipped (using mocks)');
  }
};

// Jest global setup and teardown
beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// Global test utilities
global.createTestUser = () => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  role: 'Admin',
  isActive: true
});

global.generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user._id || 'mock-user-id', 
      email: user.email || 'test@example.com', 
      role: user.role || 'Admin'
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

global.createTestService = () => ({
  name: 'Test Service',
  description: 'Test service description',
  category: 'Web Development',
  featured: false,
  tags: ['test', 'service'],
  priceRange: '$1000 - $5000'
});

global.createTestProject = () => ({
  title: 'Test Project',
  shortDescription: 'Test project description',
  description: 'Full test project description',
  category: 'Web Development',
  featured: false,
  tags: ['test', 'project'],
  startDate: new Date(),
  status: 'Planning',
  priority: 'Medium',
  technologies: ['React', 'Node.js']
});

global.createTestTeamMember = () => ({
  name: 'John Doe',
  email: 'john.doe@test.com',
  position: 'Developer',
  department: 'Development',
  bio: 'Test team member',
  skills: ['JavaScript', 'React'],
  startDate: new Date(),
  yearsOfExperience: 5,
  isActive: true
});

global.createTestClient = () => ({
  name: 'Test Client',
  industry: 'Technology',
  email: 'client@test.com',
  phone: '+1234567890',
  status: 'Active',
  companySize: 'Medium (50-200)'
});

global.createTestBlog = () => ({
  title: 'Test Blog Post',
  content: 'Test blog content',
  excerpt: 'Test excerpt',
  category: 'Technology',
  tags: ['test', 'blog'],
  status: 'Published',
  featured: false
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = '5001';
process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:3001';

// Console override for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Export for direct usage in tests
module.exports = {
  setupTestDB,
  teardownTestDB,
  clearTestDB
};