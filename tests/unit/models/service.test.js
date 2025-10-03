const { Service } = require('../../../src/models');

describe('Service Model', () => {
  describe('Validation', () => {
    test('should create a valid service', async () => {
      const serviceData = {
        name: 'Web Development',
        description: 'Complete web development services',
        category: 'Web Development'
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      expect(savedService._id).toBeDefined();
      expect(savedService.name).toBe(serviceData.name);
      expect(savedService.description).toBe(serviceData.description);
      expect(savedService.category).toBe(serviceData.category);
      expect(savedService.featured).toBe(false); // default value
    });

    test('should require name field', async () => {
      const service = new Service({
        description: 'Test description',
        category: 'Web Development'
      });

      let error;
      try {
        await service.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    test('should require description field', async () => {
      const service = new Service({
        name: 'Test Service',
        category: 'Web Development'
      });

      let error;
      try {
        await service.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.description).toBeDefined();
    });

    test('should require category field', async () => {
      const service = new Service({
        name: 'Test Service',
        description: 'Test description'
      });

      let error;
      try {
        await service.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test('should validate category enum', async () => {
      const service = new Service({
        name: 'Test Service',
        description: 'Test description',
        category: 'Invalid Category'
      });

      let error;
      try {
        await service.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test('should validate icon URL format', async () => {
      const service = new Service({
        name: 'Test Service',
        description: 'Test description',
        category: 'Web Development',
        icon: 'invalid-url'
      });

      let error;
      try {
        await service.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.icon).toBeDefined();
    });

    test('should accept valid icon URL', async () => {
      const service = new Service({
        name: 'Test Service',
        description: 'Test description',
        category: 'Web Development',
        icon: 'https://example.com/icon.png'
      });

      const savedService = await service.save();
      expect(savedService.icon).toBe('https://example.com/icon.png');
    });
  });

  describe('Schema Features', () => {
    test('should have timestamps', async () => {
      const service = new Service(createTestService());
      const savedService = await service.save();

      expect(savedService.createdAt).toBeDefined();
      expect(savedService.updatedAt).toBeDefined();
    });

    test('should have unique name constraint', async () => {
      const serviceData = createTestService();
      
      // Create first service
      const service1 = new Service(serviceData);
      await service1.save();

      // Try to create second service with same name
      const service2 = new Service(serviceData);
      
      let error;
      try {
        await service2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should handle benefits array', async () => {
      const serviceData = {
        ...createTestService(),
        benefits: [
          {
            title: 'Benefit 1',
            description: 'Description 1'
          },
          {
            title: 'Benefit 2',
            description: 'Description 2'
          }
        ]
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      expect(savedService.benefits).toHaveLength(2);
      expect(savedService.benefits[0].title).toBe('Benefit 1');
      expect(savedService.benefits[1].title).toBe('Benefit 2');
    });

    test('should handle process steps array', async () => {
      const serviceData = {
        ...createTestService(),
        process: [
          {
            stepNumber: 1,
            title: 'Step 1',
            description: 'First step'
          },
          {
            stepNumber: 2,
            title: 'Step 2',
            description: 'Second step'
          }
        ]
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      expect(savedService.process).toHaveLength(2);
      expect(savedService.process[0].stepNumber).toBe(1);
      expect(savedService.process[1].stepNumber).toBe(2);
    });
  });

  describe('Virtual Fields', () => {
    test('should include virtuals in JSON output', async () => {
      const service = new Service(createTestService());
      const savedService = await service.save();
      
      const serviceJSON = savedService.toJSON();
      expect(serviceJSON.id).toBeDefined();
      expect(serviceJSON.id).toBe(savedService._id.toString());
    });
  });

  describe('Text Search Index', () => {
    test('should support text search on indexed fields', async () => {
      const service1 = new Service({
        ...createTestService(),
        name: 'React Development',
        description: 'Modern React application development'
      });
      
      const service2 = new Service({
        ...createTestService(),
        name: 'Vue.js Development',
        description: 'Vue.js application development'
      });

      await service1.save();
      await service2.save();

      // Test text search
      const results = await Service.find({ $text: { $search: 'React' } });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('React Development');
    });
  });
});