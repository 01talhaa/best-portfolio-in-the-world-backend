const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { User, Service } = require('../../src/models');

describe('Service API Integration Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create a test user and get auth token
    const userData = {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin'
    };

    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    authToken = userResponse.body.token;
    userId = userResponse.body.data.user._id;
  });

  describe('POST /api/v1/services', () => {
    test('should create a new service with valid data', async () => {
      const serviceData = {
        name: 'Web Development Service',
        description: 'Complete web development solutions using modern technologies',
        shortDescription: 'Professional web development',
        category: 'Web Development',
        featured: true,
        tags: ['React', 'Node.js', 'MongoDB'],
        priceRange: '$2000 - $10000'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(serviceData.name);
      expect(response.body.data.description).toBe(serviceData.description);
      expect(response.body.data.category).toBe(serviceData.category);
      expect(response.body.data.featured).toBe(true);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();

      // Verify service was actually saved to database
      const savedService = await Service.findById(response.body.data._id);
      expect(savedService).toBeTruthy();
      expect(savedService.name).toBe(serviceData.name);
    });

    test('should reject service creation without authentication', async () => {
      const serviceData = {
        name: 'Unauthorized Service',
        description: 'This should fail',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .send(serviceData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    test('should reject service with invalid data', async () => {
      const invalidServiceData = {
        name: '', // Empty name
        description: 'Valid description',
        category: 'Invalid Category' // Invalid category
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidServiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject duplicate service names', async () => {
      const serviceData = {
        name: 'Unique Service Name',
        description: 'First service',
        category: 'Web Development'
      };

      // Create first service
      await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/v1/services', () => {
    beforeEach(async () => {
      // Create test services
      const services = [
        {
          name: 'Service 1',
          description: 'Description 1',
          category: 'Web Development',
          featured: true
        },
        {
          name: 'Service 2',
          description: 'Description 2',
          category: 'Mobile Development',
          featured: false
        },
        {
          name: 'Service 3',
          description: 'Description 3',
          category: 'Web Development',
          featured: true
        }
      ];

      for (const serviceData of services) {
        await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceData);
      }
    });

    test('should get all services with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBe(1);
    });

    test('should filter services by category', async () => {
      const response = await request(app)
        .get('/api/v1/services?category=Web Development')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(service => service.category === 'Web Development')).toBe(true);
    });

    test('should filter services by featured status', async () => {
      const response = await request(app)
        .get('/api/v1/services?featured=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(service => service.featured === true)).toBe(true);
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/services?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });

    test('should sort services by name', async () => {
      const response = await request(app)
        .get('/api/v1/services?sort=name')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Service 1');
      expect(response.body.data[1].name).toBe('Service 2');
      expect(response.body.data[2].name).toBe('Service 3');
    });
  });

  describe('GET /api/v1/services/:id', () => {
    let serviceId;

    beforeEach(async () => {
      const serviceData = {
        name: 'Test Service Detail',
        description: 'Detailed service description',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      serviceId = response.body.data._id;
    });

    test('should get service by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/services/${serviceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(serviceId);
      expect(response.body.data.name).toBe('Test Service Detail');
    });

    test('should return 404 for non-existent service', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/v1/services/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/v1/services/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('PUT /api/v1/services/:id', () => {
    let serviceId;

    beforeEach(async () => {
      const serviceData = {
        name: 'Original Service Name',
        description: 'Original description',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      serviceId = response.body.data._id;
    });

    test('should update service with valid data', async () => {
      const updateData = {
        name: 'Updated Service Name',
        description: 'Updated description',
        featured: true
      };

      const response = await request(app)
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.featured).toBe(true);

      // Verify update in database
      const updatedService = await Service.findById(serviceId);
      expect(updatedService.name).toBe(updateData.name);
      expect(updatedService.featured).toBe(true);
    });

    test('should reject update without authentication', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/v1/services/${serviceId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    test('should reject update with invalid data', async () => {
      const invalidUpdateData = {
        category: 'Invalid Category'
      };

      const response = await request(app)
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/services/:id', () => {
    let serviceId;

    beforeEach(async () => {
      const serviceData = {
        name: 'Service To Delete',
        description: 'This service will be deleted',
        category: 'Web Development'
      };

      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      serviceId = response.body.data._id;
    });

    test('should delete service with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion in database
      const deletedService = await Service.findById(serviceId);
      expect(deletedService).toBeNull();
    });

    test('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/services/${serviceId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');

      // Verify service still exists
      const service = await Service.findById(serviceId);
      expect(service).toBeTruthy();
    });

    test('should return 404 for non-existent service deletion', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/services/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/v1/services/featured', () => {
    beforeEach(async () => {
      const services = [
        {
          name: 'Featured Service 1',
          description: 'Description 1',
          category: 'Web Development',
          featured: true
        },
        {
          name: 'Regular Service',
          description: 'Description 2',
          category: 'Web Development',
          featured: false
        },
        {
          name: 'Featured Service 2',
          description: 'Description 3',
          category: 'Mobile Development',
          featured: true
        }
      ];

      for (const serviceData of services) {
        await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceData);
      }
    });

    test('should return only featured services', async () => {
      const response = await request(app)
        .get('/api/v1/services/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(service => service.featured === true)).toBe(true);
    });
  });

  describe('GET /api/v1/services/search', () => {
    beforeEach(async () => {
      const services = [
        {
          name: 'React Development',
          description: 'Modern React application development with hooks',
          category: 'Web Development',
          tags: ['React', 'JavaScript', 'Frontend']
        },
        {
          name: 'Node.js Backend',
          description: 'Server-side development with Node.js and Express',
          category: 'Web Development',
          tags: ['Node.js', 'Express', 'Backend']
        },
        {
          name: 'Mobile App Development',
          description: 'Cross-platform mobile apps with React Native',
          category: 'Mobile Development',
          tags: ['React Native', 'Mobile', 'iOS', 'Android']
        }
      ];

      for (const serviceData of services) {
        await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceData);
      }
    });

    test('should search services by name', async () => {
      const response = await request(app)
        .get('/api/v1/services/search?q=React')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // React Development and Mobile App (React Native)
    });

    test('should search services by description', async () => {
      const response = await request(app)
        .get('/api/v1/services/search?q=Express')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Node.js Backend');
    });

    test('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/v1/services/search?q=NonExistentTech')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test('should require search query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/services/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Search query is required');
    });
  });
});