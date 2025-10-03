const { Project } = require('../../../src/models');

describe('Project Model', () => {
  describe('Validation', () => {
    test('should create a valid project', async () => {
      const projectData = {
        title: 'Test Project',
        fullDescription: 'Full project description',
        category: 'Website',
        startDate: new Date()
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject._id).toBeDefined();
      expect(savedProject.title).toBe(projectData.title);
      expect(savedProject.fullDescription).toBe(projectData.fullDescription);
      expect(savedProject.category).toBe(projectData.category);
      expect(savedProject.featured).toBe(false); // default value
      expect(savedProject.status).toBe('Planning'); // default value
      expect(savedProject.priority).toBe('Medium'); // default value
    });

    test('should require title field', async () => {
      const project = new Project({
        fullDescription: 'Test description',
        category: 'Website',
        startDate: new Date()
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    test('should require fullDescription field', async () => {
      const project = new Project({
        title: 'Test Project',
        category: 'Website',
        startDate: new Date()
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.fullDescription).toBeDefined();
    });

    test('should validate category enum', async () => {
      const project = new Project({
        title: 'Test Project',
        fullDescription: 'Test description',
        category: 'Invalid Category',
        startDate: new Date()
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test('should validate status enum', async () => {
      const project = new Project({
        title: 'Test Project',
        fullDescription: 'Test description',
        category: 'Website',
        startDate: new Date(),
        status: 'Invalid Status'
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    test('should validate priority enum', async () => {
      const project = new Project({
        title: 'Test Project',
        fullDescription: 'Test description',
        category: 'Website',
        startDate: new Date(),
        priority: 'Invalid Priority'
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.priority).toBeDefined();
    });

    test('should validate thumbnail URL format', async () => {
      const project = new Project({
        title: 'Test Project',
        fullDescription: 'Test description',
        category: 'Website',
        startDate: new Date(),
        thumbnail: 'invalid-url'
      });

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.thumbnail).toBeDefined();
    });
  });

  describe('Schema Features', () => {
    test('should handle team members array', async () => {
      const projectData = {
        ...createTestProject(),
        teamMembers: [
          {
            member: '507f1f77bcf86cd799439011',
            role: 'Lead Developer',
            contribution: 'Main development work'
          },
          {
            member: '507f1f77bcf86cd799439012',
            role: 'Designer',
            contribution: 'UI/UX design'
          }
        ]
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.teamMembers).toHaveLength(2);
      expect(savedProject.teamMembers[0].role).toBe('Lead Developer');
      expect(savedProject.teamMembers[1].role).toBe('Designer');
    });

    test('should handle testimonials array', async () => {
      const projectData = {
        ...createTestProject(),
        testimonials: [
          {
            clientName: 'John Doe',
            testimonialText: 'Great work!',
            rating: 5
          },
          {
            clientName: 'Jane Smith',
            testimonialText: 'Excellent project!',
            rating: 4
          }
        ]
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.testimonials).toHaveLength(2);
      expect(savedProject.testimonials[0].rating).toBe(5);
      expect(savedProject.testimonials[1].rating).toBe(4);
    });

    test('should validate testimonial rating range', async () => {
      const projectData = {
        ...createTestProject(),
        testimonials: [
          {
            clientName: 'John Doe',
            testimonialText: 'Great work!',
            rating: 6 // Invalid rating > 5
          }
        ]
      };

      const project = new Project(projectData);
      
      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['testimonials.0.rating']).toBeDefined();
    });

    test('should handle challenges and results arrays', async () => {
      const projectData = {
        ...createTestProject(),
        challenges: [
          {
            challenge: 'Performance issues',
            solution: 'Implemented caching'
          }
        ],
        results: [
          {
            metric: 'Performance',
            value: '50% faster',
            description: 'Page load time improvement'
          }
        ]
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.challenges).toHaveLength(1);
      expect(savedProject.results).toHaveLength(1);
      expect(savedProject.challenges[0].challenge).toBe('Performance issues');
      expect(savedProject.results[0].metric).toBe('Performance');
    });

    test('should handle location with coordinates', async () => {
      const projectData = {
        ...createTestProject(),
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
          lat: 40.7128,
          lng: -74.0060
        }
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.location.city).toBe('New York');
      expect(savedProject.location.lat).toBe(40.7128);
      expect(savedProject.location.lng).toBe(-74.0060);
    });

    test('should validate latitude range', async () => {
      const projectData = {
        ...createTestProject(),
        location: {
          lat: 91 // Invalid latitude > 90
        }
      };

      const project = new Project(projectData);
      
      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['location.lat']).toBeDefined();
    });

    test('should validate longitude range', async () => {
      const projectData = {
        ...createTestProject(),
        location: {
          lng: 181 // Invalid longitude > 180
        }
      };

      const project = new Project(projectData);
      
      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['location.lng']).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    test('should calculate average rating virtual', async () => {
      const projectData = {
        ...createTestProject(),
        testimonials: [
          {
            clientName: 'John Doe',
            testimonialText: 'Great work!',
            rating: 5
          },
          {
            clientName: 'Jane Smith',
            testimonialText: 'Good project!',
            rating: 3
          }
        ]
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.averageRating).toBe(4.0);
    });

    test('should return 0 for average rating with no testimonials', async () => {
      const project = new Project(createTestProject());
      const savedProject = await project.save();

      expect(savedProject.averageRating).toBe(0);
    });
  });

  describe('Text Search', () => {
    test('should support text search on indexed fields', async () => {
      const project1 = new Project({
        ...createTestProject(),
        title: 'React E-commerce Platform',
        fullDescription: 'Modern e-commerce built with React'
      });
      
      const project2 = new Project({
        ...createTestProject(),
        title: 'Vue.js Dashboard',
        fullDescription: 'Admin dashboard built with Vue.js'
      });

      await project1.save();
      await project2.save();

      const results = await Project.find({ $text: { $search: 'React' } });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React E-commerce Platform');
    });
  });
});