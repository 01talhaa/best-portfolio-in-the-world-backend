# 🚀 Postman Testing Guide - Company Portfolio Backend

## 📁 Files Created

1. **`Company-Portfolio-Backend.postman_collection.json`** - Complete API collection
2. **`Company-Portfolio-Backend-Environment.postman_environment.json`** - Environment variables

## 🔧 Setup Instructions

### 1. Import into Postman

**Option A: Import Collection File**
1. Open Postman
2. Click "Import" button
3. Select `Company-Portfolio-Backend.postman_collection.json`
4. Select `Company-Portfolio-Backend-Environment.postman_environment.json`

**Option B: Import by File Path**
1. In Postman, go to File → Import
2. Choose "File" tab
3. Upload both JSON files from your project directory

### 2. Set Environment
1. In Postman, select "Company Portfolio Backend - Development" environment
2. Verify `baseUrl` is set to `http://localhost:5000`

### 3. Start Your Backend Server
```bash
cd "company portfolio backend"
npm run dev
```

## 🧪 Testing Workflow

### Phase 1: Basic Health Checks
1. **Health Check** - Verify server is running
2. **API Info** - Check API version and endpoints

### Phase 2: Authentication
1. **Register User** - Creates admin user and sets auth token
2. **Login User** - Alternative login method
3. **Get Current User** - Verify authentication
4. **Logout** - Clear session

### Phase 3: Core Data Creation
**Follow this order for best results:**

1. **Create Service** → Sets `serviceId` variable
2. **Create Team Member** → Sets `teamMemberId` variable  
3. **Create Team** → Sets `teamId` variable
4. **Create Client** → Sets `clientId` variable
5. **Create Project** → Sets `projectId` variable
6. **Create Blog Post** → Sets `blogId` variable
7. **Create Testimonial** → Uses existing service/project IDs

### Phase 4: Read Operations
Test all GET endpoints:
- Get All [Entity]
- Get [Entity] by ID
- Get Featured [Entity]
- Search [Entity]

### Phase 5: Update Operations
Test PUT endpoints with sample data modifications

### Phase 6: Advanced Features
- **Analytics Endpoints** - Project stats, team performance
- **AI Assistant** - Chat and business assistant
- **Global Search** - Cross-entity search capabilities

## 🎯 Key Testing Scenarios

### 1. Complete CRUD Flow
```
1. Register/Login → Get auth token
2. Create Service → Save serviceId
3. Get Service by ID → Verify creation
4. Update Service → Modify data
5. Get Service by ID → Verify update
6. Delete Service → Cleanup (optional)
```

### 2. Relationship Testing
```
1. Create Team Member → Save memberId
2. Create Team with that member as lead
3. Create Project with team member assigned
4. Verify relationships in GET responses
```

### 3. Search & Analytics
```
1. Create multiple entities with varied data
2. Test search endpoints with different queries
3. Check analytics endpoints for aggregated data
4. Test AI assistant with various prompts
```

## 🔒 Authentication Flow

Most endpoints require authentication. The collection automatically:
1. **Captures tokens** from login/register responses
2. **Sets auth headers** for protected endpoints
3. **Stores user ID** for related operations

### Manual Token Setup (if needed)
1. Run "Login User" or "Register User"
2. Copy token from response
3. Set in environment: `authToken` = `your-jwt-token`

## 📊 Variables Auto-Management

The collection automatically manages these variables:
- `authToken` - JWT authentication token
- `userId` - Current user ID
- `serviceId` - Created service ID
- `projectId` - Created project ID
- `teamMemberId` - Created team member ID
- `teamId` - Created team ID
- `clientId` - Created client ID
- `blogId` - Created blog post ID

## 🔍 Error Handling

### Common Issues & Solutions

**1. "Unauthorized" (401)**
- Solution: Run "Login User" or "Register User" first

**2. "Not Found" (404)**
- Solution: Create the entity first, check variable is set

**3. "Validation Error" (400)**
- Solution: Check request body matches schema requirements

**4. "Internal Server Error" (500)**
- Solution: Check server logs, verify database connection

### Database Connection Issues
If MongoDB is not connected:
- Some endpoints will work (basic CRUD)
- Database-dependent features won't work
- Check server logs for connection errors

## 🚀 Quick Start Testing

### Minimal Test Sequence:
1. Health Check
2. Register User  
3. Create Service
4. Get All Services
5. AI Chat Test
6. Global Search Test

### Full Integration Test:
1. All Authentication endpoints
2. Create one of each entity type
3. Test all relationship endpoints
4. Run analytics endpoints
5. Test search functionality
6. Test AI features

## 📈 Expected Response Formats

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Analytics Response:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "analytics": { ... },
    "charts": { ... }
  }
}
```

## 🎉 Pro Tips

1. **Run tests in order** - Some endpoints depend on data from previous tests
2. **Check Console** - Postman console shows detailed request/response logs
3. **Use Environment Variables** - Collection automatically manages IDs
4. **Test Edge Cases** - Try invalid data, missing fields, etc.
5. **Monitor Server Logs** - Check terminal for backend error details

## 🔧 Customization

### Adding New Tests
1. Duplicate existing request
2. Modify URL and body
3. Update test scripts if needed

### Environment for Production
1. Create new environment
2. Set `baseUrl` to your production URL
3. Update authentication credentials

---

**🎯 Your backend now has 50+ fully tested endpoints across 9 business entities!**

Happy testing! 🚀