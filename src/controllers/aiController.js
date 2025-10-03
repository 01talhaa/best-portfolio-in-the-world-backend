const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

class AIController {
  /**
   * Chatbot endpoint - handle general company queries
   */
  chatbot = async (req, res, next) => {
    try {
      const { message, context, conversationId } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Check if AI service is available
      const aiStatus = geminiService.getStatus();
      if (!aiStatus.available) {
        return res.status(503).json({
          success: false,
          error: 'AI service is currently unavailable. Please contact us directly.',
          fallback: {
            message: 'Our AI assistant is temporarily unavailable. Please feel free to contact us directly through our contact form or email, and our team will be happy to assist you with any questions about our services, projects, or team.',
            contactInfo: {
              email: 'contact@company.com',
              phone: '+1-XXX-XXX-XXXX'
            }
          }
        });
      }

      const result = await geminiService.generateChatResponse(message, context);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      // Log the interaction (without sensitive data)
      logger.info(`Chatbot interaction - ConversationID: ${conversationId || 'new'}, MessageLength: ${message.length}`);

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          conversationId: conversationId || this.generateConversationId(),
          timestamp: new Date().toISOString(),
          context: result.context
        }
      });
    } catch (error) {
      logger.error('Chatbot error:', error);
      next(error);
    }
  };

  /**
   * AI Assistant endpoint - provide business recommendations
   */
  assistant = async (req, res, next) => {
    try {
      const { query, preferences } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      // Check if AI service is available
      const aiStatus = geminiService.getStatus();
      if (!aiStatus.available) {
        return res.status(503).json({
          success: false,
          error: 'AI assistant is currently unavailable. Please contact our team directly.',
          fallback: {
            message: 'Our AI assistant is temporarily unavailable. Our team would be happy to provide personalized recommendations based on your requirements. Please contact us directly.',
            contactInfo: {
              email: 'contact@company.com',
              phone: '+1-XXX-XXX-XXXX'
            }
          }
        });
      }

      const result = await geminiService.generateRecommendations(query, preferences);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      // Log the interaction
      logger.info(`AI Assistant query - Query: "${query.substring(0, 100)}...", Preferences: ${JSON.stringify(preferences)}`);

      res.status(200).json({
        success: true,
        data: {
          recommendations: result.recommendations,
          query: result.query,
          preferences: result.preferences,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('AI Assistant error:', error);
      next(error);
    }
  };

  /**
   * Get AI service status
   */
  getStatus = async (req, res, next) => {
    try {
      const status = geminiService.getStatus();
      
      res.status(200).json({
        success: true,
        data: {
          ...status,
          endpoints: {
            chatbot: '/api/v1/ai/chatbot',
            assistant: '/api/v1/ai/assistant'
          },
          capabilities: [
            'Company information queries',
            'Service recommendations',
            'Team member suggestions',
            'Project case studies',
            'General business assistance'
          ]
        }
      });
    } catch (error) {
      logger.error('AI Status error:', error);
      next(error);
    }
  };

  /**
   * Get AI analytics and usage stats (Admin only)
   */
  getAnalytics = async (req, res, next) => {
    try {
      // TODO: Implement AI usage analytics
      // This would track:
      // - Number of chatbot interactions
      // - Common queries and topics
      // - Response satisfaction ratings
      // - Peak usage times
      // - Most requested services/information

      res.status(200).json({
        success: true,
        data: {
          message: 'AI analytics not yet implemented',
          placeholder: {
            totalInteractions: 0,
            avgResponseTime: 0,
            popularQueries: [],
            satisfactionRating: 0
          }
        }
      });
    } catch (error) {
      logger.error('AI Analytics error:', error);
      next(error);
    }
  };

  /**
   * Feedback endpoint for AI responses
   */
  submitFeedback = async (req, res, next) => {
    try {
      const { conversationId, rating, feedback, responseId } = req.body;
      
      // TODO: Store feedback in database for AI improvement
      // This would help:
      // - Improve AI responses over time
      // - Identify common issues
      // - Track user satisfaction
      
      logger.info(`AI Feedback received - ConversationID: ${conversationId}, Rating: ${rating}`);

      res.status(200).json({
        success: true,
        message: 'Thank you for your feedback! This helps us improve our AI assistant.',
        data: {
          conversationId,
          feedbackReceived: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('AI Feedback error:', error);
      next(error);
    }
  };

  /**
   * Generate a unique conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new AIController();