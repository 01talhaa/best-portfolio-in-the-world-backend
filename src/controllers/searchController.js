const SearchService = require('../services/searchService');
const logger = require('../utils/logger');

class SearchController {
  /**
   * Global search endpoint
   */
  globalSearch = async (req, res, next) => {
    try {
      const { q: query, limit, entities, ...filters } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters long'
        });
      }

      const options = {
        limit: parseInt(limit) || 50,
        entities: entities ? entities.split(',') : undefined,
        filters
      };

      const results = await SearchService.globalSearch(query.trim(), options);
      
      logger.info(`Global search performed: "${query}" - ${results.totalResults} results`);

      res.status(200).json(results);
    } catch (error) {
      logger.error('Global search error:', error);
      next(error);
    }
  };

  /**
   * Smart search with suggestions
   */
  smartSearch = async (req, res, next) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters long'
        });
      }

      const options = {
        limit: parseInt(limit) || 20
      };

      const results = await SearchService.smartSearch(query.trim(), options);
      
      logger.info(`Smart search performed: "${query}" - ${results.totalResults} results, ${results.suggestions?.length || 0} suggestions`);

      res.status(200).json(results);
    } catch (error) {
      logger.error('Smart search error:', error);
      next(error);
    }
  };

  /**
   * Get autocomplete suggestions
   */
  getAutocomplete = async (req, res, next) => {
    try {
      const results = await SearchService.getAutocompleteData();
      
      res.status(200).json(results);
    } catch (error) {
      logger.error('Autocomplete error:', error);
      next(error);
    }
  };

  /**
   * Search analytics (admin only)
   */
  getSearchAnalytics = async (req, res, next) => {
    try {
      // TODO: Implement search analytics
      // This would track:
      // - Most popular search terms
      // - Search volume over time
      // - Zero-result searches
      // - Click-through rates from search results

      res.status(200).json({
        success: true,
        message: 'Search analytics not yet implemented',
        data: {
          placeholder: {
            totalSearches: 0,
            popularQueries: [],
            zeroResultSearches: [],
            avgResultsPerSearch: 0
          }
        }
      });
    } catch (error) {
      logger.error('Search analytics error:', error);
      next(error);
    }
  };
}

module.exports = new SearchController();