const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

class CompanyPortfolioAIService {
  constructor() {
    console.log('Initializing AI Service...');
    
    if (!config.GEMINI_API_KEY) {
      logger.warn('Gemini API key not provided. AI features will be disabled.');
      this.genAI = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });
      console.log('AI model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      logger.error('Failed to initialize Gemini AI:', error);
      throw error;
    }

    this.cache = {
      companyData: null,
      lastFetched: null,
      cacheDuration: 300000 // 5 minutes
    };
  }

  async getCompanyData() {
    const now = Date.now();
    if (this.cache.companyData && (now - this.cache.lastFetched < this.cache.cacheDuration)) {
      return this.cache.companyData;
    }

    try {
      const { Service, Project, TeamMember } = require('../models');
      let context = 'COMPANY PORTFOLIO\n\n';
      
      try {
        const services = await Service.find();
        context += 'SERVICES:\n';
        services.forEach(s => context += `- ${s.name}: ${s.description}\n`);
        context += '\n';
      } catch (err) {
        context += 'SERVICES: Available on request\n\n';
      }

      try {
        const projects = await Project.find();
        context += 'PROJECTS:\n';
        projects.forEach(p => context += `- ${p.title}: ${p.category}\n`);
        context += '\n';
      } catch (err) {
        context += 'PROJECTS: Portfolio available on request\n\n';
      }

      context += 'We specialize in web development, mobile apps, UI/UX design, real estate, and consulting.\n';
      
      this.cache.companyData = context;
      this.cache.lastFetched = now;
      return context;
    } catch (error) {
      return 'Company Portfolio: Technology and business solutions provider.';
    }
  }

  async generateChatResponse(message, conversationContext = '') {
    if (!this.genAI) {
      return {
        success: false,
        error: 'AI service is not available. Please contact us directly.'
      };
    }

    try {
      const companyContext = await this.getCompanyData();
      const prompt = `You are an AI assistant for a company. Help users understand our services.

COMPANY INFO:
${companyContext}

USER: ${message}

Respond helpfully:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        response: response.text()
      };
    } catch (error) {
      logger.error('AI chat error:', error);
      return {
        success: false,
        error: 'Sorry, I encountered an error. Please try again or contact us directly.'
      };
    }
  }

  async generateRecommendations(query, preferences = {}) {
    if (!this.genAI) {
      return {
        success: false,
        error: 'AI service is not available. Please contact us directly.'
      };
    }

    try {
      const companyContext = await this.getCompanyData();
      const prefString = Object.entries(preferences).map(([k,v]) => `${k}: ${v}`).join(', ');

      const prompt = `Based on the query and preferences, provide business recommendations.

COMPANY INFO:
${companyContext}

QUERY: ${query}
PREFERENCES: ${prefString}

Provide recommendations:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return {
        success: true,
        recommendations: response.text(),
        query,
        preferences
      };
    } catch (error) {
      logger.error('AI recommendations error:', error);
      return {
        success: false,
        error: 'Sorry, I encountered an error generating recommendations.'
      };
    }
  }

  getStatus() {
    return {
      available: !!this.genAI,
      model: this.genAI ? 'gemini-1.5-flash' : null,
      apiKeyConfigured: !!config.GEMINI_API_KEY
    };
  }
}

module.exports = new CompanyPortfolioAIService();
