const { validate, serviceValidation, projectValidation } = require('../../../src/middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('validate middleware', () => {
    test('should pass validation with valid data', () => {
      req.body = {
        name: 'Test Service',
        description: 'Test description',
        category: 'Web Development'
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject validation with missing required fields', () => {
      req.body = {
        name: 'Test Service'
        // Missing description and category
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject validation with invalid field types', () => {
      req.body = {
        name: 123, // Should be string
        description: 'Test description',
        category: 'Web Development'
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should sanitize and transform valid data', () => {
      req.body = {
        name: '  Test Service  ', // Should be trimmed
        description: 'Test description',
        category: 'Web Development',
        featured: 'true' // Should be converted to boolean
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(req.body.name).toBe('Test Service');
      expect(req.body.featured).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    test('should validate nested objects', () => {
      req.body = {
        name: 'Test Service',
        description: 'Test description',
        category: 'Web Development',
        benefits: [
          {
            title: 'Benefit 1',
            description: 'Description 1'
          },
          {
            title: '', // Invalid empty title
            description: 'Description 2'
          }
        ]
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate arrays', () => {
      req.body = {
        name: 'Test Service',
        description: 'Test description',
        category: 'Web Development',
        tags: ['tag1', 'tag2', ''] // Contains empty string
      };

      const middleware = validate(serviceValidation.create);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Service Validation Schemas', () => {
    describe('serviceValidation.create', () => {
      test('should validate required fields', () => {
        const validData = {
          name: 'Web Development',
          description: 'Complete web development services',
          category: 'Web Development'
        };

        const { error } = serviceValidation.create.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should validate category enum', () => {
        const invalidData = {
          name: 'Test Service',
          description: 'Test description',
          category: 'Invalid Category'
        };

        const { error } = serviceValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('category');
      });

      test('should validate URL formats', () => {
        const invalidData = {
          name: 'Test Service',
          description: 'Test description',
          category: 'Web Development',
          icon: 'invalid-url'
        };

        const { error } = serviceValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('icon');
      });

      test('should validate string lengths', () => {
        const invalidData = {
          name: 'A'.repeat(101), // Too long
          description: 'Test description',
          category: 'Web Development'
        };

        const { error } = serviceValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('name');
      });
    });

    describe('serviceValidation.update', () => {
      test('should allow partial updates', () => {
        const validData = {
          name: 'Updated Service Name'
        };

        const { error } = serviceValidation.update.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should validate provided fields', () => {
        const invalidData = {
          category: 'Invalid Category'
        };

        const { error } = serviceValidation.update.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('category');
      });
    });
  });

  describe('Project Validation Schemas', () => {
    describe('projectValidation.create', () => {
      test('should validate required fields', () => {
        const validData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString()
        };

        const { error } = projectValidation.create.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should validate date formats', () => {
        const invalidData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: 'invalid-date'
        };

        const { error } = projectValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('startDate');
      });

      test('should validate status enum', () => {
        const invalidData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString(),
          status: 'Invalid Status'
        };

        const { error } = projectValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('status');
      });

      test('should validate priority enum', () => {
        const invalidData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString(),
          priority: 'Invalid Priority'
        };

        const { error } = projectValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('priority');
      });

      test('should validate team members structure', () => {
        const invalidData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString(),
          teamMembers: [
            {
              member: 'invalid-object-id',
              role: 'Developer'
            }
          ]
        };

        const { error } = projectValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('teamMembers');
      });

      test('should validate testimonials structure', () => {
        const validData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString(),
          testimonials: [
            {
              clientName: 'John Doe',
              testimonialText: 'Great work!',
              rating: 5
            }
          ]
        };

        const { error } = projectValidation.create.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should validate testimonial rating range', () => {
        const invalidData = {
          title: 'Test Project',
          fullDescription: 'Complete project description',
          category: 'Website',
          startDate: new Date().toISOString(),
          testimonials: [
            {
              clientName: 'John Doe',
              testimonialText: 'Great work!',
              rating: 6 // Invalid rating > 5
            }
          ]
        };

        const { error } = projectValidation.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('testimonials');
      });
    });
  });

  describe('Common Validation Patterns', () => {
    test('should validate ObjectId format', () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const invalidObjectId = 'invalid-id';

      // Test with a schema that uses objectId validation
      const testSchema = require('joi').object({
        id: require('joi').string().pattern(/^[0-9a-fA-F]{24}$/)
      });

      const validResult = testSchema.validate({ id: validObjectId });
      const invalidResult = testSchema.validate({ id: invalidObjectId });

      expect(validResult.error).toBeUndefined();
      expect(invalidResult.error).toBeDefined();
    });

    test('should validate email format', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';

      const testSchema = require('joi').object({
        email: require('joi').string().email()
      });

      const validResult = testSchema.validate({ email: validEmail });
      const invalidResult = testSchema.validate({ email: invalidEmail });

      expect(validResult.error).toBeUndefined();
      expect(invalidResult.error).toBeDefined();
    });

    test('should validate phone format', () => {
      const validPhone = '+1234567890';
      const invalidPhone = 'invalid-phone';

      const testSchema = require('joi').object({
        phone: require('joi').string().pattern(/^[\+]?[1-9][\d]{0,15}$/)
      });

      const validResult = testSchema.validate({ phone: validPhone });
      const invalidResult = testSchema.validate({ phone: invalidPhone });

      expect(validResult.error).toBeUndefined();
      expect(invalidResult.error).toBeDefined();
    });

    test('should validate URL format', () => {
      const validUrl = 'https://example.com';
      const invalidUrl = 'invalid-url';

      const testSchema = require('joi').object({
        url: require('joi').string().uri({ scheme: ['http', 'https'] })
      });

      const validResult = testSchema.validate({ url: validUrl });
      const invalidResult = testSchema.validate({ url: invalidUrl });

      expect(validResult.error).toBeUndefined();
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe('Query Validation', () => {
    test('should validate pagination parameters', () => {
      req.query = {
        page: '2',
        limit: '10'
      };

      const middleware = validate(require('../../src/middleware/validation').queryValidation, 'query');
      middleware(req, res, next);

      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(10);
      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid pagination parameters', () => {
      req.query = {
        page: '-1',
        limit: '0'
      };

      const middleware = validate(require('../../src/middleware/validation').queryValidation, 'query');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('should apply default values for missing parameters', () => {
      req.query = {};

      const middleware = validate(require('../../src/middleware/validation').queryValidation, 'query');
      middleware(req, res, next);

      expect(req.query.page).toBe(1);
      expect(req.query.limit).toBe(20);
      expect(next).toHaveBeenCalled();
    });
  });
});