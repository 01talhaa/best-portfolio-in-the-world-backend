const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

/**
 * Test data generators using faker
 */
class TestDataGenerator {
  static generateUser(overrides = {}) {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123',
      role: faker.helpers.arrayElement(['Admin', 'Employee', 'Client']),
      ...overrides
    };
  }

  static generateService(overrides = {}) {
    const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing', 'Data Analytics'];
    const technologies = ['React', 'Node.js', 'MongoDB', 'Express', 'Vue.js', 'Angular', 'Python', 'AWS'];
    
    return {
      name: faker.commerce.productName() + ' Service',
      description: faker.lorem.paragraphs(2),
      shortDescription: faker.lorem.sentence(),
      category: faker.helpers.arrayElement(categories),
      featured: faker.datatype.boolean(),
      tags: faker.helpers.arrayElements(technologies, { min: 2, max: 5 }),
      priceRange: faker.helpers.arrayElement(['$1000 - $5000', '$5000 - $10000', '$10000 - $25000']),
      ...overrides
    };
  }

  static generateProject(overrides = {}) {
    const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing'];
    const statuses = ['Planning', 'In Progress', 'Completed', 'On Hold'];
    const technologies = ['React', 'Node.js', 'MongoDB', 'Express', 'Vue.js', 'Angular', 'Python', 'AWS'];
    
    return {
      title: faker.commerce.productName() + ' Project',
      description: faker.lorem.paragraphs(3),
      shortDescription: faker.lorem.sentence(),
      category: faker.helpers.arrayElement(categories),
      status: faker.helpers.arrayElement(statuses),
      featured: faker.datatype.boolean(),
      technologies: faker.helpers.arrayElements(technologies, { min: 3, max: 6 }),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      budget: faker.number.int({ min: 5000, max: 50000 }),
      projectUrl: faker.internet.url(),
      githubUrl: `https://github.com/${faker.internet.userName()}/${faker.lorem.slug()}`,
      ...overrides
    };
  }

  static generateTeamMember(overrides = {}) {
    const departments = ['Development', 'Design', 'Marketing', 'Management', 'Sales'];
    const skills = ['React', 'Node.js', 'MongoDB', 'Express', 'Vue.js', 'Angular', 'Python', 'AWS', 'Docker', 'Kubernetes'];
    
    return {
      name: faker.person.fullName(),
      position: faker.person.jobTitle(),
      department: faker.helpers.arrayElement(departments),
      bio: faker.lorem.paragraphs(2),
      skills: faker.helpers.arrayElements(skills, { min: 3, max: 7 }),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      socialLinks: {
        linkedin: `https://linkedin.com/in/${faker.internet.userName()}`,
        github: `https://github.com/${faker.internet.userName()}`,
        twitter: `https://twitter.com/${faker.internet.userName()}`
      },
      startDate: faker.date.past({ years: 3 }),
      yearsOfExperience: faker.number.int({ min: 1, max: 15 }),
      ...overrides
    };
  }

  static generateClient(overrides = {}) {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing'];
    
    return {
      name: faker.company.name(),
      industry: faker.helpers.arrayElement(industries),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      contactPerson: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number()
      },
      ...overrides
    };
  }

  static generateBlogPost(overrides = {}) {
    const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Development'];
    const tags = ['Tech', 'Innovation', 'Web Dev', 'Mobile', 'AI', 'Machine Learning', 'Blockchain'];
    
    return {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(5),
      excerpt: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(categories),
      tags: faker.helpers.arrayElements(tags, { min: 2, max: 4 }),
      featured: faker.datatype.boolean(),
      published: faker.datatype.boolean(),
      readTime: faker.number.int({ min: 2, max: 15 }),
      ...overrides
    };
  }

  static generateTestimonial(overrides = {}) {
    return {
      testimonial: faker.lorem.paragraphs(2),
      rating: faker.number.int({ min: 4, max: 5 }),
      clientName: faker.person.fullName(),
      clientPosition: faker.person.jobTitle(),
      clientCompany: faker.company.name(),
      ...overrides
    };
  }

  static generateContactSubmission(overrides = {}) {
    const projectTypes = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing'];
    const budgets = ['$5000 - $10000', '$10000 - $25000', '$25000 - $50000', '$50000+'];
    
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      subject: faker.lorem.sentence(),
      message: faker.lorem.paragraphs(2),
      phone: faker.phone.number(),
      company: faker.company.name(),
      projectType: faker.helpers.arrayElement(projectTypes),
      budget: faker.helpers.arrayElement(budgets),
      ...overrides
    };
  }

  static generateMultiple(generator, count, overrides = {}) {
    return Array.from({ length: count }, () => generator(overrides));
  }
}

/**
 * Database testing utilities
 */
class DatabaseTestUtils {
  static async clearDatabase() {
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  static async createTestData() {
    const { User, Service, Project, TeamMember, Client, Blog, Testimonial } = require('../../src/models');
    
    // Create test users
    const adminUser = await User.create(TestDataGenerator.generateUser({
      email: 'admin@test.com',
      role: 'Admin'
    }));

    const clientUser = await User.create(TestDataGenerator.generateUser({
      email: 'client@test.com',
      role: 'Client'
    }));

    // Create test services
    const services = await Service.create(
      TestDataGenerator.generateMultiple(TestDataGenerator.generateService, 5)
    );

    // Create test team members
    const teamMembers = await TeamMember.create(
      TestDataGenerator.generateMultiple(TestDataGenerator.generateTeamMember, 3)
    );

    // Create test clients
    const clients = await Client.create(
      TestDataGenerator.generateMultiple(TestDataGenerator.generateClient, 3)
    );

    // Create test projects with relationships
    const projects = await Project.create([
      TestDataGenerator.generateProject({
        client: clients[0]._id,
        teamMembers: [teamMembers[0]._id, teamMembers[1]._id]
      }),
      TestDataGenerator.generateProject({
        client: clients[1]._id,
        teamMembers: [teamMembers[1]._id, teamMembers[2]._id]
      }),
      TestDataGenerator.generateProject({
        client: clients[2]._id,
        teamMembers: [teamMembers[0]._id, teamMembers[2]._id]
      })
    ]);

    // Create test blog posts
    const blogPosts = await Blog.create(
      TestDataGenerator.generateMultiple(TestDataGenerator.generateBlogPost, 5, {
        author: adminUser._id
      })
    );

    return {
      users: { admin: adminUser, client: clientUser },
      services,
      teamMembers,
      clients,
      projects,
      blogPosts
    };
  }

  static async dropDatabase() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
    }
  }
}

/**
 * HTTP testing utilities
 */
class HttpTestUtils {
  static async authenticateUser(app, userData) {
    const request = require('supertest');
    
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    return response.body.token;
  }

  static async createAuthenticatedUser(app, userType = 'Admin') {
    const request = require('supertest');
    const userData = TestDataGenerator.generateUser({ role: userType });
    
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    return {
      user: registerResponse.body.data.user,
      token: registerResponse.body.token,
      credentials: userData
    };
  }

  static createAuthHeaders(token) {
    return { Authorization: `Bearer ${token}` };
  }

  static expectValidationError(response, field) {
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain(field);
  }

  static expectUnauthorized(response) {
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Access denied');
  }

  static expectForbidden(response) {
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('permission');
  }

  static expectNotFound(response) {
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('not found');
  }

  static expectSuccessResponse(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  }

  static expectPaginatedResponse(response, expectedLength = null) {
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('pages');
    
    if (expectedLength !== null) {
      expect(response.body.data).toHaveLength(expectedLength);
    }
  }
}

/**
 * Mock utilities
 */
class MockUtils {
  static mockGeminiAI() {
    return {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => Promise.resolve('Mocked AI response')
        }
      })
    };
  }

  static mockEmailService() {
    return {
      sendEmail: jest.fn().mockResolvedValue({ success: true }),
      sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
      sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true })
    };
  }

  static mockFileUpload() {
    return {
      upload: jest.fn().mockResolvedValue({
        url: 'https://example.com/mocked-file.jpg',
        filename: 'mocked-file.jpg'
      })
    };
  }

  static mockLogger() {
    return {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
  }
}

/**
 * Test assertions utilities
 */
class AssertionUtils {
  static assertValidObjectId(id) {
    expect(mongoose.Types.ObjectId.isValid(id)).toBe(true);
  }

  static assertValidDate(date) {
    expect(new Date(date).toString()).not.toBe('Invalid Date');
  }

  static assertValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBe(true);
  }

  static assertValidUrl(url) {
    expect(() => new URL(url)).not.toThrow();
  }

  static assertArrayNotEmpty(array) {
    expect(Array.isArray(array)).toBe(true);
    expect(array.length).toBeGreaterThan(0);
  }

  static assertPasswordNotExposed(obj) {
    expect(obj.password).toBeUndefined();
  }

  static assertTimestamps(obj) {
    expect(obj.createdAt).toBeDefined();
    expect(obj.updatedAt).toBeDefined();
    this.assertValidDate(obj.createdAt);
    this.assertValidDate(obj.updatedAt);
  }

  static assertPaginationMetadata(pagination, expectedTotal = null) {
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('pages');
    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.total).toBe('number');
    expect(typeof pagination.pages).toBe('number');
    
    if (expectedTotal !== null) {
      expect(pagination.total).toBe(expectedTotal);
    }
  }
}

module.exports = {
  TestDataGenerator,
  DatabaseTestUtils,
  HttpTestUtils,
  MockUtils,
  AssertionUtils
};