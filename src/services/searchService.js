const logger = require('../utils/logger');

/**
 * Search service for advanced search capabilities across all entities
 */
class SearchService {
  /**
   * Global search across all entities
   */
  static async globalSearch(query, options = {}) {
    try {
      const { 
        limit = 50, 
        entities = ['services', 'projects', 'team-members', 'blog', 'testimonials'],
        filters = {}
      } = options;

      const searchRegex = new RegExp(query, 'i');
      const results = {};

      // Import models dynamically to avoid circular dependencies
      const { Service, Project, TeamMember, Blog, Testimonial } = require('../models');

      // Search Services
      if (entities.includes('services')) {
        results.services = await Service.find({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { tags: searchRegex }
          ],
          ...filters.services
        })
        .limit(Math.floor(limit / entities.length))
        .select('name description category icon featured');
      }

      // Search Projects
      if (entities.includes('projects')) {
        results.projects = await Project.find({
          $or: [
            { title: searchRegex },
            { shortDescription: searchRegex },
            { fullDescription: searchRegex },
            { category: searchRegex },
            { tags: searchRegex },
            { technologies: searchRegex }
          ],
          ...filters.projects
        })
        .limit(Math.floor(limit / entities.length))
        .select('title shortDescription category thumbnail featured')
        .populate('client', 'name logo');
      }

      // Search Team Members
      if (entities.includes('team-members')) {
        results.teamMembers = await TeamMember.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { position: searchRegex },
            { skills: searchRegex },
            { bio: searchRegex }
          ],
          ...filters.teamMembers
        })
        .limit(Math.floor(limit / entities.length))
        .select('firstName lastName position profileImage skills featured');
      }

      // Search Blog Posts
      if (entities.includes('blog')) {
        results.blog = await Blog.find({
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { excerpt: searchRegex },
            { tags: searchRegex }
          ],
          status: 'Published',
          publishedDate: { $lte: new Date() },
          ...filters.blog
        })
        .limit(Math.floor(limit / entities.length))
        .select('title excerpt thumbnail publishedDate category featured')
        .populate('author', 'firstName lastName');
      }

      // Search Testimonials
      if (entities.includes('testimonials')) {
        results.testimonials = await Testimonial.find({
          $or: [
            { clientName: searchRegex },
            { clientCompany: searchRegex },
            { quote: searchRegex },
            { serviceCategory: searchRegex }
          ],
          approved: true,
          ...filters.testimonials
        })
        .limit(Math.floor(limit / entities.length))
        .select('clientName clientCompany quote rating serviceCategory featured');
      }

      // Calculate total results
      const totalResults = Object.values(results).reduce((total, items) => total + (items?.length || 0), 0);

      return {
        success: true,
        query,
        totalResults,
        results
      };
    } catch (error) {
      logger.error('Global search error:', error);
      return {
        success: false,
        error: 'Search failed',
        results: {}
      };
    }
  }

  /**
   * Smart search with suggestions and autocomplete
   */
  static async smartSearch(query, options = {}) {
    try {
      const { limit = 10 } = options;
      
      // Perform global search
      const searchResults = await this.globalSearch(query, { limit });
      
      // Generate suggestions based on search results
      const suggestions = await this.generateSuggestions(query, searchResults.results);
      
      return {
        ...searchResults,
        suggestions
      };
    } catch (error) {
      logger.error('Smart search error:', error);
      return {
        success: false,
        error: 'Smart search failed',
        results: {},
        suggestions: []
      };
    }
  }

  /**
   * Generate search suggestions
   */
  static async generateSuggestions(query, results) {
    const suggestions = [];
    
    try {
      // Add service suggestions
      if (results.services?.length > 0) {
        suggestions.push(...results.services.map(s => ({
          type: 'service',
          text: s.name,
          category: s.category
        })));
      }

      // Add skill suggestions from team members
      if (results.teamMembers?.length > 0) {
        const skills = results.teamMembers.flatMap(tm => tm.skills || []);
        const uniqueSkills = [...new Set(skills)];
        suggestions.push(...uniqueSkills.slice(0, 5).map(skill => ({
          type: 'skill',
          text: skill,
          category: 'Team Skills'
        })));
      }

      // Add project category suggestions
      if (results.projects?.length > 0) {
        const categories = [...new Set(results.projects.map(p => p.category))];
        suggestions.push(...categories.map(category => ({
          type: 'project-category',
          text: category,
          category: 'Project Categories'
        })));
      }

      // Add blog topic suggestions
      if (results.blog?.length > 0) {
        const categories = [...new Set(results.blog.map(b => b.category))];
        suggestions.push(...categories.map(category => ({
          type: 'blog-category',
          text: category,
          category: 'Blog Topics'
        })));
      }

      return suggestions.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular search terms and autocomplete data
   */
  static async getAutocompleteData() {
    try {
      const { Service, Project, TeamMember, Blog } = require('../models');

      const [serviceCategories, projectCategories, skills, blogCategories] = await Promise.all([
        Service.distinct('category'),
        Project.distinct('category'),
        TeamMember.distinct('skills'),
        Blog.distinct('category')
      ]);

      return {
        success: true,
        data: {
          serviceCategories,
          projectCategories,
          skills: skills.slice(0, 50), // Limit skills to most common ones
          blogCategories
        }
      };
    } catch (error) {
      logger.error('Error getting autocomplete data:', error);
      return {
        success: false,
        error: 'Failed to get autocomplete data',
        data: {}
      };
    }
  }
}

module.exports = SearchService;