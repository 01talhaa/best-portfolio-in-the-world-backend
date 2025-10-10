# 🚀 AI Frontend Generation Prompt for Portfolio/Company Website

## 📋 Project Overview
Create a complete, responsive frontend website that integrates with a portfolio/company backend API. The website should be adaptable for personal portfolios, company websites, real estate agencies, consulting firms, and other professional service businesses. The frontend must use all available API endpoints with proper authentication, error handling, and modern UI/UX design.

---

## 🎯 Technical Requirements

### **Framework & Technologies**
- **Frontend Framework**: React.js with TypeScript (preferred) or Next.js
- **Styling**: Tailwind CSS with custom component library
- **State Management**: React Context API or Zustand for authentication & global state
- **HTTP Client**: Axios with interceptors for token management
- **Routing**: React Router DOM or Next.js routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Headless UI or Radix UI primitives
- **Icons**: Lucide React or Heroicons
- **Animations**: Framer Motion for smooth transitions
- **Image Handling**: Next.js Image component or react-image-gallery
- **File Uploads**: react-dropzone with progress indicators

### **Environment Configuration**
Create `.env.local` file with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_NAME=Portfolio Website
NEXT_PUBLIC_SITE_DESCRIPTION=Professional Portfolio & Company Website
```

---

## 🔐 Authentication System Implementation

### **Required Auth Features**
1. **JWT Token Management**: Store access & refresh tokens securely
2. **Automatic Token Refresh**: Interceptor-based token renewal
3. **Protected Routes**: Route guards for admin sections
4. **Role-Based Access**: Different UI for admin vs public users
5. **Login/Register Forms**: With proper validation & error handling
6. **Logout Functionality**: Clear tokens & redirect

### **Auth Context Structure**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### **API Authentication Endpoints**
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User login  
- **POST** `/auth/refresh` - Token refresh
- **POST** `/auth/logout` - User logout

**Request/Response Examples:**
```typescript
// Login Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Login Response
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📋 Projects Management System

### **Projects API Endpoints**
- **GET** `/projects` - Get all projects
- **POST** `/projects` - Create new project
- **GET** `/projects/:id` - Get project by ID
- **PUT** `/projects/:id` - Update project
- **DELETE** `/projects/:id` - Delete project
- **GET** `/projects/featured` - Get featured projects

### **Project Data Structure**
```typescript
interface Project {
  _id: string;
  title: string;
  shortDescription?: string;
  fullDescription: string;
  category: 'Website' | 'Mobile App' | 'Web App' | 'E-commerce' | 'Residential' | 'Commercial' | 'Industrial' | 'Software' | 'Design' | 'Consulting' | 'Other';
  featured: boolean;
  tags: string[];
  thumbnail?: string;
  images: string[];
  videos: string[];
  links: {
    demo?: string;
    github?: string;
    documentation?: string;
  };
  technologies: Array<{
    name: string;
    category: string;
  }>;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  client?: string;
  teamMembers: string[];
  startDate?: Date;
  endDate?: Date;
  budget?: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### **Required Project Pages**
1. **Projects Gallery**: Grid layout with filtering by category/tags
2. **Project Detail**: Individual project showcase with gallery
3. **Admin Projects**: CRUD interface for managing projects
4. **Featured Projects**: Hero section showcasing top projects

---

## 👥 Team Members Management

### **Team API Endpoints**
- **GET** `/team-members` - Get all team members
- **POST** `/team-members` - Create team member
- **GET** `/team-members/:id` - Get team member by ID
- **PUT** `/team-members/:id` - Update team member
- **DELETE** `/team-members/:id` - Delete team member

### **Team Member Data Structure**
```typescript
interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  bio?: string;
  profileImage?: string;
  skills: string[];
  experience?: number;
  department?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    behance?: string;
  };
  isActive: boolean;
  joinDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Required Team Pages**
1. **Team Page**: Professional team showcase with bios
2. **Team Member Profile**: Individual member detail pages
3. **Admin Team**: Management interface for team members

---

## 🛠️ Services Management

### **Services API Endpoints**
- **GET** `/services` - Get all services
- **POST** `/services` - Create service
- **GET** `/services/:id` - Get service by ID
- **PUT** `/services/:id` - Update service
- **DELETE** `/services/:id` - Delete service
- **GET** `/services/category/:category` - Get services by category
- **GET** `/services/featured` - Get featured services

### **Service Data Structure**
```typescript
interface Service {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  featured: boolean;
  category: 'Web Development' | 'Mobile Development' | 'UI/UX Design' | 'Property Management' | 'Real Estate' | 'Software Development' | 'Consulting' | 'Other';
  tags: string[];
  images: string[];
  videos: string[];
  pricing?: {
    type: 'project' | 'hourly' | 'monthly' | 'custom';
    basePrice?: number;
    currency?: string;
    description?: string;
  };
  duration?: string;
  deliverables: string[];
  prerequisites: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### **Required Service Pages**
1. **Services Overview**: Grid layout with category filtering
2. **Service Detail**: Individual service pages with pricing
3. **Admin Services**: CRUD interface for service management

---

## 🏢 Clients Management

### **Clients API Endpoints**
- **GET** `/clients` - Get all clients
- **POST** `/clients` - Create client
- **GET** `/clients/:id` - Get client by ID
- **PUT** `/clients/:id` - Update client
- **DELETE** `/clients/:id` - Delete client

### **Client Data Structure**
```typescript
interface Client {
  _id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  description?: string;
  contactPerson: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  projectHistory: string[];
  status: 'prospect' | 'active' | 'inactive' | 'completed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Required Client Pages**
1. **Clients Showcase**: Logo grid or testimonial section
2. **Client Detail**: Individual client case studies
3. **Admin Clients**: CRM-style client management

---

## 📤 File Upload System

### **Upload API Endpoints**
- **POST** `/upload/single` - Upload single file
- **POST** `/upload/multiple` - Upload multiple files
- **DELETE** `/upload/:publicId` - Delete uploaded file

### **Upload Implementation**
```typescript
// Upload with entity association
const uploadFile = async (file: File, entityType: string, entityId: string, imageType?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  if (imageType) formData.append('imageType', imageType);

  const response = await api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```

---

## 🎨 Design & UI Requirements

### **Design System**
1. **Color Palette**: Professional, modern colors adaptable to different industries
2. **Typography**: Clean, readable font hierarchy
3. **Components**: Reusable UI components with consistent styling
4. **Responsive Design**: Mobile-first approach with breakpoints
5. **Dark/Light Mode**: Theme switching capability
6. **Loading States**: Skeleton screens and spinners
7. **Error States**: User-friendly error messages
8. **Success States**: Confirmation messages and animations

### **Page Layout Structure**
1. **Header**: Navigation with logo, menu, and auth buttons
2. **Hero Section**: Eye-catching intro with CTA buttons
3. **Main Content**: Dynamic content based on page type
4. **Footer**: Contact info, social links, copyright

### **Required Pages**
1. **Home**: Hero + featured projects + services + team highlights
2. **About**: Company/personal story + team overview
3. **Projects**: Portfolio gallery with filtering
4. **Services**: Service offerings with detailed descriptions
5. **Team**: Team member profiles and bios
6. **Clients**: Client testimonials and case studies
7. **Contact**: Contact form + company information
8. **Admin Dashboard**: Protected admin interface for content management
9. **Login/Register**: Authentication pages

---

## 🔧 Technical Implementation Details

### **API Client Setup**
```typescript
// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### **Form Validation Schemas**
```typescript
// validation/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  fullDescription: z.string().min(1, 'Description is required'),
  category: z.enum(['Website', 'Mobile App', 'Web App', 'E-commerce', 'Residential', 'Commercial', 'Industrial', 'Software', 'Design', 'Consulting', 'Other']),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export const teamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.string().min(1, 'Position is required'),
  email: z.string().email().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
});
```

### **Error Handling**
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

---

## 🌟 Advanced Features

### **1. Search & Filtering**
- Global search across projects, services, team members
- Category-based filtering
- Tag-based filtering
- Sort options (date, name, featured)

### **2. SEO Optimization**
- Meta tags for all pages
- Open Graph tags for social sharing
- JSON-LD structured data
- Sitemap generation

### **3. Performance**
- Image optimization and lazy loading
- Code splitting and lazy imports
- Caching strategies
- Bundle optimization

### **4. Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management

### **5. Analytics Integration**
- Google Analytics setup
- Event tracking for user interactions
- Performance monitoring

---

## 📱 Responsive Design Requirements

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px - 1440px
- **Large Desktop**: 1441px+

### **Mobile-First Features**
- Touch-friendly navigation
- Swipe gestures for galleries
- Optimized image sizes
- Compressed layouts

---

## 🔒 Security Implementation

### **Client-Side Security**
- Input sanitization
- XSS prevention
- CSRF protection
- Secure token storage
- Rate limiting awareness

### **Data Validation**
- Client-side validation with server-side backup
- Proper error messages
- Input length limits
- File type validation for uploads

---

## 🚀 Deployment Configuration

### **Environment Files**
```env
# .env.local (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_NAME=My Portfolio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.yourportfolio.com/api/v1
NEXT_PUBLIC_SITE_NAME=Professional Portfolio
NEXT_PUBLIC_SITE_URL=https://yourportfolio.com
```

### **Build Configuration**
- Optimized production builds
- Static file generation where applicable
- CDN integration for assets
- Error boundary implementation

---

## 🎯 Industry Adaptability

### **Portfolio Variations**
1. **Personal Portfolio**: Focus on individual projects and skills
2. **Company Website**: Emphasize team, services, and client success
3. **Real Estate**: Property listings, agent profiles, market data
4. **Consulting Firm**: Case studies, expertise areas, thought leadership
5. **Creative Agency**: Visual portfolio, creative process, client work

### **Customizable Elements**
- Color schemes per industry
- Section ordering and visibility
- Content types and fields
- Navigation structure
- Call-to-action buttons

---

## 📋 Development Checklist

### **Phase 1: Core Setup**
- [ ] Project initialization with chosen framework
- [ ] Environment configuration
- [ ] API client setup with interceptors
- [ ] Authentication system implementation
- [ ] Basic routing structure

### **Phase 2: Core Features**
- [ ] Projects CRUD with gallery
- [ ] Team members management
- [ ] Services showcase
- [ ] Clients portfolio
- [ ] File upload system

### **Phase 3: UI/UX**
- [ ] Responsive design implementation
- [ ] Loading and error states
- [ ] Form validation
- [ ] Search and filtering
- [ ] Navigation and routing

### **Phase 4: Advanced Features**
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Analytics integration
- [ ] Testing implementation

### **Phase 5: Production Ready**
- [ ] Error boundary implementation
- [ ] Security hardening
- [ ] Production deployment setup
- [ ] Documentation creation
- [ ] Final testing and QA

---

## 🎨 Design Inspiration & Best Practices

### **Modern Portfolio Trends**
- Clean, minimalist design
- Bold typography
- High-quality images
- Smooth animations
- Interactive elements
- Mobile-first approach

### **Industry-Specific Considerations**
- **Tech Companies**: Modern, innovative design with dark themes
- **Creative Agencies**: Artistic, colorful, portfolio-heavy
- **Real Estate**: Professional, trust-building, location-focused
- **Consulting**: Corporate, authoritative, results-oriented

---

## 🔧 Maintenance & Updates

### **Content Management**
- Easy-to-use admin interface
- Bulk operations for efficiency
- Preview functionality
- Version control for content

### **Scalability Considerations**
- Modular component structure
- Efficient state management
- Optimized API calls
- Caching strategies

---

## 🎯 Final Output Requirements

**Create a complete, production-ready frontend website that:**

1. ✅ **Integrates seamlessly** with the provided API endpoints
2. ✅ **Handles authentication** with automatic token refresh
3. ✅ **Manages all content types** (projects, team, services, clients)
4. ✅ **Provides admin interface** for content management
5. ✅ **Delivers excellent UX** with responsive design
6. ✅ **Implements best practices** for security, performance, SEO
7. ✅ **Adapts to different industries** with configurable themes
8. ✅ **Works out-of-the-box** by simply changing the API base URL

**The website should be professional, modern, and ready for immediate deployment for any portfolio, company, or professional services website.**

---

## 🚀 Start Building!

Use this comprehensive specification to create a world-class frontend that leverages all the API capabilities. The result should be a versatile, professional website template that can be easily customized for different industries and use cases while maintaining consistency with the API structure.

**Key Success Metrics:**
- All API endpoints properly integrated
- Responsive design across all devices
- Smooth user experience with proper loading states
- Admin functionality for content management
- Easy deployment and configuration
- Industry adaptability with minimal changes

**Remember**: The frontend should be so well-integrated with the API that changing just the `NEXT_PUBLIC_API_BASE_URL` environment variable should make it work with any instance of this backend system!