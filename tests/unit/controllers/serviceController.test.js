const request = require('supertest');
const express = require('express');
const serviceController = require('../../../src/controllers/serviceController');
const { Service } = require('../../../src/models');

// Mock the Service model
jest.mock('../../../src/models', () => ({
  Service: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  }
}));

describe('Service Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = createTestUser();
      next();
    });

    // Setup routes
    app.get('/services', serviceController.getAll);
    app.post('/services', serviceController.create);
    app.get('/services/:id', serviceController.getById);
    app.put('/services/:id', serviceController.update);
    app.delete('/services/:id', serviceController.delete);
    app.get('/services/featured', serviceController.getFeatured);
    app.get('/services/search', serviceController.search);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /services', () => {
    test('should return all services with pagination', async () => {
      const mockServices = [
        { _id: '1', name: 'Service 1', category: 'Web Development' },
        { _id: '2', name: 'Service 2', category: 'Mobile Development' }
      ];

      Service.countDocuments.mockResolvedValue(2);
      Service.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockServices)
            })
          })
        })
      });

      const response = await request(app)
        .get('/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    test('should handle pagination parameters', async () => {
      Service.countDocuments.mockResolvedValue(50);
      Service.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      await request(app)
        .get('/services?page=2&limit=10')
        .expect(200);

      const findCall = Service.find.mock.calls[0];
      expect(findCall).toBeDefined();
    });

    test('should handle filtering by category', async () => {
      Service.countDocuments.mockResolvedValue(1);
      Service.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      await request(app)
        .get('/services?category=Web Development')
        .expect(200);

      expect(Service.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Web Development'
        })
      );
    });

    test('should handle database errors', async () => {
      Service.countDocuments.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/services')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /services', () => {
    test('should create a new service', async () => {
      const newService = {
        name: 'New Service',
        description: 'Service description',
        category: 'Web Development'
      };

      const mockSavedService = {
        _id: 'new-id',
        ...newService,
        save: jest.fn().mockResolvedValue({ _id: 'new-id', ...newService })
      };

      // Mock constructor
      Service.mockImplementation(() => mockSavedService);

      const response = await request(app)
        .post('/services')
        .send(newService)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newService.name);
      expect(mockSavedService.save).toHaveBeenCalled();
    });

    test('should handle validation errors', async () => {
      const invalidService = {
        name: '', // Invalid empty name
        description: 'Service description'
        // Missing required category
      };

      const validationError = new Error('Validation error');
      validationError.errors = {
        name: { message: 'Name is required' },
        category: { message: 'Category is required' }
      };

      const mockService = {
        save: jest.fn().mockRejectedValue(validationError)
      };

      Service.mockImplementation(() => mockService);

      const response = await request(app)
        .post('/services')
        .send(invalidService)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle duplicate name error', async () => {
      const duplicateService = {
        name: 'Existing Service',
        description: 'Service description',
        category: 'Web Development'
      };

      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;

      const mockService = {
        save: jest.fn().mockRejectedValue(duplicateError)
      };

      Service.mockImplementation(() => mockService);

      const response = await request(app)
        .post('/services')
        .send(duplicateService)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /services/:id', () => {
    test('should return service by ID', async () => {
      const serviceId = 'valid-id';
      const mockService = {
        _id: serviceId,
        name: 'Test Service',
        category: 'Web Development'
      };

      Service.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockService)
      });

      const response = await request(app)
        .get(`/services/${serviceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(serviceId);
      expect(Service.findById).toHaveBeenCalledWith(serviceId);
    });

    test('should return 404 for non-existent service', async () => {
      const serviceId = 'non-existent-id';

      Service.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get(`/services/${serviceId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should handle invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      const castError = new Error('Cast error');
      castError.name = 'CastError';

      Service.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(castError)
      });

      const response = await request(app)
        .get(`/services/${invalidId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('PUT /services/:id', () => {
    test('should update service successfully', async () => {
      const serviceId = 'valid-id';
      const updateData = {
        name: 'Updated Service',
        description: 'Updated description'
      };

      const updatedService = {
        _id: serviceId,
        ...updateData,
        category: 'Web Development'
      };

      Service.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedService)
      });

      const response = await request(app)
        .put(`/services/${serviceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(Service.findByIdAndUpdate).toHaveBeenCalledWith(
        serviceId,
        updateData,
        expect.objectContaining({
          new: true,
          runValidators: true
        })
      );
    });

    test('should return 404 for non-existent service update', async () => {
      const serviceId = 'non-existent-id';

      Service.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .put(`/services/${serviceId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /services/:id', () => {
    test('should delete service successfully', async () => {
      const serviceId = 'valid-id';
      const deletedService = {
        _id: serviceId,
        name: 'Deleted Service'
      };

      Service.findByIdAndDelete.mockResolvedValue(deletedService);

      const response = await request(app)
        .delete(`/services/${serviceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
      expect(Service.findByIdAndDelete).toHaveBeenCalledWith(serviceId);
    });

    test('should return 404 for non-existent service deletion', async () => {
      const serviceId = 'non-existent-id';

      Service.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/services/${serviceId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /services/featured', () => {
    test('should return featured services', async () => {
      const featuredServices = [
        { _id: '1', name: 'Featured Service 1', featured: true },
        { _id: '2', name: 'Featured Service 2', featured: true }
      ];

      Service.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(featuredServices)
        })
      });

      const response = await request(app)
        .get('/services/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(Service.find).toHaveBeenCalledWith({ featured: true });
    });
  });

  describe('GET /services/search', () => {
    test('should search services by query', async () => {
      const searchResults = [
        { _id: '1', name: 'Web Development', description: 'React development' }
      ];

      Service.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(searchResults)
          })
        })
      });

      const response = await request(app)
        .get('/services/search?q=web')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(Service.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: { $search: 'web' }
        })
      );
    });

    test('should return empty results for no query', async () => {
      const response = await request(app)
        .get('/services/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Search query is required');
    });
  });
});