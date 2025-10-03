const mongoose = require('mongoose');

describe('Basic Model Tests', () => {
  beforeEach(() => {
    // Mock mongoose connection for these tests
    if (!mongoose.connection.readyState) {
      mongoose.connection.readyState = 1;
    }
  });

  describe('Environment Setup', () => {
    test('should have test environment configured', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('should have JWT secret configured', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
    });

    test('should have mongoose available', () => {
      expect(mongoose).toBeDefined();
      expect(mongoose.Schema).toBeDefined();
    });
  });

  describe('Model Loading', () => {
    test('should load models without errors', () => {
      let models;
      expect(() => {
        models = require('../../../src/models');
      }).not.toThrow();
      
      expect(models).toBeDefined();
      expect(models.Service).toBeDefined();
      expect(models.Project).toBeDefined();
      expect(models.TeamMember).toBeDefined();
      expect(models.User).toBeDefined();
    });

    test('should have proper model constructors', () => {
      const { Service, Project, TeamMember, User } = require('../../../src/models');
      
      expect(typeof Service).toBe('function');
      expect(typeof Project).toBe('function');
      expect(typeof TeamMember).toBe('function');
      expect(typeof User).toBe('function');
    });
  });

  describe('Schema Validation Basics', () => {
    test('should validate Service model structure', () => {
      const { Service } = require('../../../src/models');
      const schema = Service.schema;
      
      expect(schema).toBeDefined();
      expect(schema.paths.name).toBeDefined();
      expect(schema.paths.description).toBeDefined();
      expect(schema.paths.category).toBeDefined();
    });

    test('should validate Project model structure', () => {
      const { Project } = require('../../../src/models');
      const schema = Project.schema;
      
      expect(schema).toBeDefined();
      expect(schema.paths.title).toBeDefined();
      expect(schema.paths.fullDescription).toBeDefined();
      expect(schema.paths.category).toBeDefined();
    });

    test('should validate TeamMember model structure', () => {
      const { TeamMember } = require('../../../src/models');
      const schema = TeamMember.schema;
      
      expect(schema).toBeDefined();
      expect(schema.paths.firstName).toBeDefined();
      expect(schema.paths.lastName).toBeDefined();
      expect(schema.paths.email).toBeDefined();
    });

    test('should validate User model structure', () => {
      const { User } = require('../../../src/models');
      const schema = User.schema;
      
      expect(schema).toBeDefined();
      expect(schema.paths.username).toBeDefined();
      expect(schema.paths.email).toBeDefined();
      expect(schema.paths.password).toBeDefined();
      expect(schema.paths.role).toBeDefined();
    });
  });

  describe('Model Schema Properties', () => {
    test('should have correct required fields for Service', () => {
      const { Service } = require('../../../src/models');
      const schema = Service.schema;
      
      expect(schema.paths.name.isRequired).toBe(true);
      expect(schema.paths.description.isRequired).toBe(true);
      expect(schema.paths.category.isRequired).toBe(true);
    });

    test('should have correct required fields for Project', () => {
      const { Project } = require('../../../src/models');
      const schema = Project.schema;
      
      expect(schema.paths.title.isRequired).toBe(true);
      expect(schema.paths.fullDescription.isRequired).toBe(true);
      expect(schema.paths.category.isRequired).toBe(true);
    });

    test('should have correct required fields for TeamMember', () => {
      const { TeamMember } = require('../../../src/models');
      const schema = TeamMember.schema;
      
      expect(schema.paths.firstName.isRequired).toBe(true);
      expect(schema.paths.lastName.isRequired).toBe(true);
    });

    test('should have correct required fields for User', () => {
      const { User } = require('../../../src/models');
      const schema = User.schema;
      
      expect(schema.paths.username.isRequired).toBe(true);
      expect(schema.paths.email.isRequired).toBe(true);
      expect(schema.paths.password.isRequired).toBe(true);
      // Role has a default value, so it's not required
      expect(schema.paths.role).toBeDefined();
    });
  });

  describe('Schema Enums', () => {
    test('should have correct category enum for Service', () => {
      const { Service } = require('../../../src/models');
      const categoryEnum = Service.schema.paths.category.enumValues;
      
      expect(Array.isArray(categoryEnum)).toBe(true);
      expect(categoryEnum.length).toBeGreaterThan(0);
      expect(categoryEnum).toContain('Web Development');
    });

    test('should have correct category enum for Project', () => {
      const { Project } = require('../../../src/models');
      const categoryEnum = Project.schema.paths.category.enumValues;
      
      expect(Array.isArray(categoryEnum)).toBe(true);
      expect(categoryEnum.length).toBeGreaterThan(0);
      expect(categoryEnum).toContain('Website');
    });

    test('should have correct role enum for User', () => {
      const { User } = require('../../../src/models');
      const roleEnum = User.schema.paths.role.enumValues;
      
      expect(Array.isArray(roleEnum)).toBe(true);
      expect(roleEnum.length).toBeGreaterThan(0);
      expect(roleEnum).toContain('Admin');
    });
  });

  describe('Virtual Fields', () => {
    test('should have virtual fields defined for TeamMember', () => {
      const { TeamMember } = require('../../../src/models');
      const virtuals = Object.keys(TeamMember.schema.virtuals);
      
      expect(virtuals).toContain('fullName');
    });

    test('should have virtual fields properly configured', () => {
      const { TeamMember } = require('../../../src/models');
      const fullNameVirtual = TeamMember.schema.virtuals.fullName;
      
      expect(fullNameVirtual).toBeDefined();
      expect(typeof fullNameVirtual.getters[0]).toBe('function');
    });
  });

  describe('Timestamps', () => {
    test('should have timestamps enabled for all models', () => {
      const { Service, Project, TeamMember, User } = require('../../../src/models');
      
      expect(Service.schema.options.timestamps).toBe(true);
      expect(Project.schema.options.timestamps).toBe(true);
      expect(TeamMember.schema.options.timestamps).toBe(true);
      expect(User.schema.options.timestamps).toBe(true);
    });
  });
});