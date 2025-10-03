const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { User, Service, Project, Client, TeamMember } = require('../../src/models');

describe('Company Portfolio E2E Tests', () => {
  let adminToken;
  let clientToken;
  let adminUserId;
  let clientUserId;

  beforeAll(async () => {
    // Create admin user
    const adminResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@portfolio.com',
        password: 'admin123',
        role: 'Admin'
      });
    
    adminToken = adminResponse.body.token;
    adminUserId = adminResponse.body.data.user._id;

    // Create client user
    const clientResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Client User',
        email: 'client@portfolio.com',
        password: 'client123',
        role: 'Client'
      });
    
    clientToken = clientResponse.body.token;
    clientUserId = clientResponse.body.data.user._id;
  });

  describe('Complete Portfolio Workflow', () => {
    let serviceId;
    let projectId;
    let clientId;
    let teamMemberId;

    test('Admin can set up complete portfolio data', async () => {
      // 1. Create services
      const serviceResponse = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Full Stack Development',
          description: 'Complete web application development using modern technologies',
          shortDescription: 'End-to-end web development',
          category: 'Web Development',
          featured: true,
          tags: ['React', 'Node.js', 'MongoDB', 'Express'],
          priceRange: '$5000 - $15000'
        });

      expect(serviceResponse.status).toBe(201);
      serviceId = serviceResponse.body.data._id;

      // 2. Create team member
      const teamMemberResponse = await request(app)
        .post('/api/v1/team-members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Smith',
          position: 'Senior Full Stack Developer',
          department: 'Development',
          bio: 'Experienced developer with 5+ years in web development',
          skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
          email: 'john@portfolio.com',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johnsmith',
            github: 'https://github.com/johnsmith'
          },
          startDate: new Date('2020-01-15'),
          yearsOfExperience: 5
        });

      expect(teamMemberResponse.status).toBe(201);
      teamMemberId = teamMemberResponse.body.data._id;

      // 3. Create client
      const clientResponse = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'TechCorp Inc.',
          industry: 'Technology',
          email: 'contact@techcorp.com',
          phone: '+1-555-0123',
          website: 'https://techcorp.com',
          address: {
            street: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          contactPerson: {
            name: 'Jane Doe',
            email: 'jane@techcorp.com',
            phone: '+1-555-0124'
          }
        });

      expect(clientResponse.status).toBe(201);
      clientId = clientResponse.body.data._id;

      // 4. Create project with relationships
      const projectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E-commerce Platform',
          description: 'Modern e-commerce platform with advanced features',
          shortDescription: 'Next-gen e-commerce solution',
          category: 'Web Development',
          status: 'Completed',
          featured: true,
          client: clientId,
          teamMembers: [teamMemberId],
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-06-30'),
          budget: 25000,
          projectUrl: 'https://demo-ecommerce.com',
          githubUrl: 'https://github.com/portfolio/ecommerce'
        });

      expect(projectResponse.status).toBe(201);
      projectId = projectResponse.body.data._id;

      // 5. Add testimonial to project
      const testimonialData = {
        testimonial: 'Excellent work! The team delivered beyond our expectations.',
        rating: 5,
        clientName: 'Jane Doe',
        clientPosition: 'CTO',
        clientCompany: 'TechCorp Inc.'
      };

      const testimonialResponse = await request(app)
        .post(`/api/v1/projects/${projectId}/testimonials`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testimonialData);

      expect(testimonialResponse.status).toBe(201);

      // 6. Verify all data was created correctly
      const projectDetailResponse = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      const projectData = projectDetailResponse.body.data;
      expect(projectData.title).toBe('E-commerce Platform');
      expect(projectData.client._id).toBe(clientId);
      expect(projectData.teamMembers).toHaveLength(1);
      expect(projectData.teamMembers[0]._id).toBe(teamMemberId);
      expect(projectData.testimonials).toHaveLength(1);
      expect(projectData.testimonials[0].rating).toBe(5);
    });

    test('Client can view portfolio data but cannot modify', async () => {
      // Client can view services
      const servicesResponse = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(servicesResponse.body.success).toBe(true);
      expect(servicesResponse.body.data.length).toBeGreaterThan(0);

      // Client can view projects
      const projectsResponse = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(projectsResponse.body.success).toBe(true);
      expect(projectsResponse.body.data.length).toBeGreaterThan(0);

      // Client can view team members
      const teamResponse = await request(app)
        .get('/api/v1/team-members')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(teamResponse.body.success).toBe(true);

      // Client cannot create services
      await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Unauthorized Service',
          description: 'This should fail',
          category: 'Web Development'
        })
        .expect(403);

      // Client cannot create projects
      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Unauthorized Project',
          description: 'This should fail',
          category: 'Web Development'
        })
        .expect(403);
    });

    test('Public endpoints work without authentication', async () => {
      // Public can view featured services
      const featuredServicesResponse = await request(app)
        .get('/api/v1/services/featured')
        .expect(200);

      expect(featuredServicesResponse.body.success).toBe(true);
      expect(featuredServicesResponse.body.data.every(service => service.featured)).toBe(true);

      // Public can view featured projects
      const featuredProjectsResponse = await request(app)
        .get('/api/v1/projects/featured')
        .expect(200);

      expect(featuredProjectsResponse.body.success).toBe(true);
      expect(featuredProjectsResponse.body.data.every(project => project.featured)).toBe(true);

      // Public can search services
      const searchResponse = await request(app)
        .get('/api/v1/services/search?q=development')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);

      // Public can view team members
      const teamResponse = await request(app)
        .get('/api/v1/team-members')
        .expect(200);

      expect(teamResponse.body.success).toBe(true);
    });

    test('Contact form submission workflow', async () => {
      // Submit contact form (public endpoint)
      const contactData = {
        name: 'Potential Client',
        email: 'potential@client.com',
        subject: 'Project Inquiry',
        message: 'I am interested in your web development services.',
        phone: '+1-555-9999',
        company: 'Future Corp',
        projectType: 'Web Development',
        budget: '$10000 - $20000'
      };

      const contactResponse = await request(app)
        .post('/api/v1/contact')
        .send(contactData)
        .expect(201);

      expect(contactResponse.body.success).toBe(true);
      expect(contactResponse.body.message).toContain('received');

      const submissionId = contactResponse.body.data._id;

      // Admin can view contact submissions
      const submissionsResponse = await request(app)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(submissionsResponse.body.success).toBe(true);
      expect(submissionsResponse.body.data.length).toBeGreaterThan(0);

      // Admin can mark submission as read
      const markReadResponse = await request(app)
        .put(`/api/v1/contact/${submissionId}/mark-read`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(markReadResponse.body.success).toBe(true);
      expect(markReadResponse.body.data.status).toBe('Read');

      // Client cannot view contact submissions
      await request(app)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    test('Search and filtering functionality', async () => {
      // Search services by technology
      const serviceSearchResponse = await request(app)
        .get('/api/v1/services/search?q=React')
        .expect(200);

      expect(serviceSearchResponse.body.success).toBe(true);
      expect(serviceSearchResponse.body.data.length).toBeGreaterThan(0);

      // Filter services by category
      const categoryFilterResponse = await request(app)
        .get('/api/v1/services?category=Web Development')
        .expect(200);

      expect(categoryFilterResponse.body.success).toBe(true);
      expect(categoryFilterResponse.body.data.every(service => 
        service.category === 'Web Development'
      )).toBe(true);

      // Search projects by technology
      const projectSearchResponse = await request(app)
        .get('/api/v1/projects/search?q=MongoDB')
        .expect(200);

      expect(projectSearchResponse.body.success).toBe(true);

      // Filter projects by status
      const statusFilterResponse = await request(app)
        .get('/api/v1/projects?status=Completed')
        .expect(200);

      expect(statusFilterResponse.body.success).toBe(true);
      expect(statusFilterResponse.body.data.every(project => 
        project.status === 'Completed'
      )).toBe(true);

      // Filter team members by department
      const departmentFilterResponse = await request(app)
        .get('/api/v1/team-members?department=Development')
        .expect(200);

      expect(departmentFilterResponse.body.success).toBe(true);
      expect(departmentFilterResponse.body.data.every(member => 
        member.department === 'Development'
      )).toBe(true);
    });

    test('Pagination works correctly', async () => {
      // Test pagination on services
      const page1Response = await request(app)
        .get('/api/v1/services?page=1&limit=1')
        .expect(200);

      expect(page1Response.body.success).toBe(true);
      expect(page1Response.body.data).toHaveLength(1);
      expect(page1Response.body.pagination.page).toBe(1);
      expect(page1Response.body.pagination.limit).toBe(1);
      expect(page1Response.body.pagination.total).toBeGreaterThan(0);

      // Test pagination on projects
      const projectPaginationResponse = await request(app)
        .get('/api/v1/projects?page=1&limit=1')
        .expect(200);

      expect(projectPaginationResponse.body.success).toBe(true);
      expect(projectPaginationResponse.body.pagination).toBeDefined();
    });

    test('Admin can manage all entities', async () => {
      // Admin can update service
      const serviceUpdateResponse = await request(app)
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Full Stack Development',
          featured: false
        })
        .expect(200);

      expect(serviceUpdateResponse.body.data.name).toBe('Updated Full Stack Development');
      expect(serviceUpdateResponse.body.data.featured).toBe(false);

      // Admin can update project
      const projectUpdateResponse = await request(app)
        .put(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'In Progress',
          budget: 30000
        })
        .expect(200);

      expect(projectUpdateResponse.body.data.status).toBe('In Progress');
      expect(projectUpdateResponse.body.data.budget).toBe(30000);

      // Admin can update team member
      const teamUpdateResponse = await request(app)
        .put(`/api/v1/team-members/${teamMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          position: 'Lead Full Stack Developer',
          yearsOfExperience: 6
        })
        .expect(200);

      expect(teamUpdateResponse.body.data.position).toBe('Lead Full Stack Developer');
      expect(teamUpdateResponse.body.data.yearsOfExperience).toBe(6);

      // Admin can update client
      const clientUpdateResponse = await request(app)
        .put(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          industry: 'Financial Technology',
          website: 'https://newtechcorp.com'
        })
        .expect(200);

      expect(clientUpdateResponse.body.data.industry).toBe('Financial Technology');
      expect(clientUpdateResponse.body.data.website).toBe('https://newtechcorp.com');
    });

    test('Data relationships are maintained correctly', async () => {
      // Get project with populated relationships
      const projectResponse = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      const project = projectResponse.body.data;

      // Verify client relationship
      expect(project.client).toBeDefined();
      expect(project.client._id).toBe(clientId);
      expect(project.client.name).toBe('TechCorp Inc.');

      // Verify team member relationship
      expect(project.teamMembers).toHaveLength(1);
      expect(project.teamMembers[0]._id).toBe(teamMemberId);
      expect(project.teamMembers[0].name).toBe('John Smith');

      // Verify testimonials
      expect(project.testimonials).toHaveLength(1);
      expect(project.testimonials[0].rating).toBe(5);

      // Get client projects
      const clientProjectsResponse = await request(app)
        .get(`/api/v1/clients/${clientId}/projects`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(clientProjectsResponse.body.data).toHaveLength(1);
      expect(clientProjectsResponse.body.data[0]._id).toBe(projectId);

      // Get team member projects
      const memberProjectsResponse = await request(app)
        .get(`/api/v1/team-members/${teamMemberId}/projects`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(memberProjectsResponse.body.data).toHaveLength(1);
      expect(memberProjectsResponse.body.data[0]._id).toBe(projectId);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Handle non-existent resource requests', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      // Non-existent service
      await request(app)
        .get(`/api/v1/services/${nonExistentId}`)
        .expect(404);

      // Non-existent project
      await request(app)
        .get(`/api/v1/projects/${nonExistentId}`)
        .expect(404);

      // Non-existent team member
      await request(app)
        .get(`/api/v1/team-members/${nonExistentId}`)
        .expect(404);

      // Non-existent client
      await request(app)
        .get(`/api/v1/clients/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('Handle invalid ObjectId formats', async () => {
      await request(app)
        .get('/api/v1/services/invalid-id')
        .expect(400);

      await request(app)
        .get('/api/v1/projects/invalid-id')
        .expect(400);

      await request(app)
        .get('/api/v1/team-members/invalid-id')
        .expect(400);
    });

    test('Handle malformed request data', async () => {
      // Invalid JSON structure
      await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send('invalid-json')
        .expect(400);

      // Missing required fields
      await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      // Invalid field values
      await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '', // Empty name
          category: 'Invalid Category' // Invalid enum value
        })
        .expect(400);
    });

    test('Handle rate limiting and security', async () => {
      // Test that endpoints require proper authentication
      await request(app)
        .post('/api/v1/services')
        .send({
          name: 'Unauthorized Service',
          description: 'This should fail',
          category: 'Web Development'
        })
        .expect(401);

      // Test that role-based access is enforced
      await request(app)
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('Performance and Scalability', () => {
    test('Handle large datasets efficiently', async () => {
      // Create multiple services for pagination testing
      const services = Array.from({ length: 25 }, (_, i) => ({
        name: `Performance Test Service ${i + 1}`,
        description: `Description for service ${i + 1}`,
        category: 'Web Development',
        featured: i % 5 === 0 // Every 5th service is featured
      }));

      for (const service of services) {
        await request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(service);
      }

      // Test pagination with large dataset
      const paginationResponse = await request(app)
        .get('/api/v1/services?page=1&limit=10')
        .expect(200);

      expect(paginationResponse.body.data).toHaveLength(10);
      expect(paginationResponse.body.pagination.total).toBeGreaterThan(25);
      expect(paginationResponse.body.pagination.pages).toBeGreaterThan(2);

      // Test search performance
      const searchResponse = await request(app)
        .get('/api/v1/services/search?q=Performance')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBe(25);
    });

    test('Handle concurrent requests', async () => {
      // Simulate concurrent service creation
      const concurrentPromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/v1/services')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Concurrent Service ${i + 1}`,
            description: `Concurrent service description ${i + 1}`,
            category: 'Web Development'
          })
      );

      const responses = await Promise.all(concurrentPromises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // All services should have unique names
      const names = responses.map(r => r.body.data.name);
      const uniqueNames = [...new Set(names)];
      expect(uniqueNames).toHaveLength(5);
    });
  });
});