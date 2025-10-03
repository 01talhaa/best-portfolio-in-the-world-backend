<<<<<<< HEAD
# best-portfolio-in-the-world-backend
=======
# Company Portfolio Backend

A comprehensive, scalable backend API for a multi-industry company website built with Node.js, Express.js, MongoDB, and Google Gemini AI integration.

## Features

### Core Functionality
- **Multi-industry Support**: Web development, mobile development, UI/UX design, real estate, property management, consulting
- **RESTful API**: Full CRUD operations for all entities
- **API Versioning**: Clean versioning strategy starting with v1
- **Authentication & Authorization**: JWT-based auth with role-based access control (RBAC)
- **Advanced Search**: Global search across all entities with smart suggestions
- **AI Integration**: Google Gemini AI chatbot and business assistant

### Entities & Models
- **Services**: Company services with categories, benefits, and process flows
- **Team Members**: Detailed profiles with skills, experience, education, and achievements
- **Teams**: Team management with member assignments and project tracking
- **Projects**: Complete project portfolio with client details and team assignments
- **Clients**: Client management with industry categorization and partnership tracking
- **Blog**: Content management system with rich features and SEO optimization
- **Testimonials**: Client feedback system with approval workflow
- **Contact Submissions**: Lead management with status tracking and assignment

### AI Features
- **Chatbot**: Intelligent assistant for company inquiries
- **Business Assistant**: AI-powered recommendations for services, team members, and projects
- **Context-Aware Responses**: AI responses based on comprehensive company data

### Technical Features
- **Robust Error Handling**: Centralized error management
- **Input Validation**: Comprehensive validation using Joi
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet, CORS, XSS protection, NoSQL injection prevention
- **Logging**: Structured logging with Winston
- **Database**: MongoDB with Mongoose ODM
- **Middleware**: Modular middleware architecture

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Gemini AI API key (optional, for AI features)

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd "company portfolio backend"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configurations:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/company-portfolio
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Google Gemini AI (optional)
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # Other configurations...
   ```

4. **Start MongoDB**
   - Local: Ensure MongoDB is running
   - Cloud: Update MONGODB_URI with your connection string

5. **Run the Application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

6. **Verify Installation**
   Visit `http://localhost:5000/health` to check if the server is running.

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh JWT token

#### Services
- `GET /services` - Get all services
- `GET /services/featured` - Get featured services
- `GET /services/category/:category` - Get services by category
- `GET /services/:id` - Get service by ID
- `POST /services` - Create service (Auth required)

#### Projects
- `GET /projects` - Get all projects
- `GET /projects/featured` - Get featured projects
- `GET /projects/category/:category` - Get projects by category
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project (Auth required)

#### Team Members
- `GET /team-members` - Get all team members
- `GET /team-members/featured` - Get featured team members
- `GET /team-members/skills/:skill` - Get members by skill
- `GET /team-members/:id` - Get team member by ID

#### AI Endpoints
- `POST /ai/chatbot` - Chat with AI assistant
- `POST /ai/assistant` - Get AI business recommendations
- `GET /ai/status` - Check AI service status

#### Search
- `GET /search/global?q=query` - Global search across all entities
- `GET /search/smart?q=query` - Smart search with suggestions
- `GET /search/autocomplete` - Get autocomplete data

#### Contact
- `POST /contact` - Submit contact form
- `GET /contact` - Get all submissions (Auth required)
- `PATCH /contact/:id/status` - Update submission status

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocuments": 100
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## User Roles & Permissions

### Roles
- **Admin**: Full access to all features
- **Manager**: Access to client and project management
- **Editor**: Content creation and editing
- **Viewer**: Read-only access

### Default Permissions
- **Public**: Can view services, projects, team members, blog posts, testimonials
- **Authenticated**: Based on role permissions
- **Admin**: Can perform all CRUD operations

## AI Integration

### Google Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add key to `.env` file as `GEMINI_API_KEY`
3. AI features will be automatically enabled

### AI Capabilities
- **Company Knowledge**: AI has access to all company data
- **Service Recommendations**: Suggests best services for client needs
- **Team Matching**: Recommends team members based on project requirements
- **Case Studies**: Provides relevant project examples
- **Contextual Responses**: Understands company context for accurate responses

## Development

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes (versioned)
├── services/        # Business logic services
├── utils/           # Utility functions
└── server.js        # Main server file
```

### Scripts
```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm test            # Run tests
```

### Adding New Features
1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Add routes in `src/routes/v1/`
4. Add validation schemas in `src/middleware/validation.js`
5. Update route index file

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Joi validation schemas
- **XSS Protection**: Clean user inputs
- **NoSQL Injection**: Sanitize MongoDB queries
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers

## Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Error Tracking**: Centralized error handling
- **Request Logging**: HTTP request logging with Morgan
- **Health Checks**: `/health` endpoint for monitoring

## Deployment

### Environment Variables
Ensure all required environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY` (optional)

### Production Considerations
- Use a proper MongoDB cluster
- Set up proper logging infrastructure
- Configure reverse proxy (nginx)
- Enable SSL/TLS
- Set up monitoring and alerting
- Use PM2 for process management

## API Testing

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Get services
curl http://localhost:5000/api/v1/services

# Contact form submission
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","message":"Hello"}'
```

### Using Postman
Import the API endpoints and test with different scenarios.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email contact@company.com or create an issue in the repository.

---

**Note**: This is a comprehensive backend solution. Customize the models, validation rules, and business logic according to your specific company requirements.
>>>>>>> origin/master
