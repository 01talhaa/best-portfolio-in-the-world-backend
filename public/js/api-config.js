// Global API configuration
window.API_CONFIG = {
    // This will be dynamically set based on environment
    BASE_URL: null,
    
    // Initialize the configuration
    init: function() {
        // Check if we're in development or production
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Development environment
            this.BASE_URL = 'http://localhost:5000/api/v1';
        } else {
            // Production environment - same domain
            this.BASE_URL = `${protocol}//${hostname}/api/v1`;
        }
        
        console.log('API_CONFIG initialized:', {
            hostname: hostname,
            protocol: protocol,
            BASE_URL: this.BASE_URL
        });
    },
    
    // Get headers for authenticated requests
    getAuthHeaders: function() {
        const token = localStorage.getItem('accessToken') || 
                     (document.getElementById('authToken') && document.getElementById('authToken').value);
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Make API request with proper error handling
    makeRequest: async function(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };
        
        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        console.log('Making request:', { url, config });
        
        try {
            const response = await fetch(url, config);
            
            // Handle token refresh for 401 errors
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry with new token
                    config.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
                    return await fetch(url, config);
                }
            }
            
            return response;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },
    
    // Refresh token helper
    refreshToken: async function() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        try {
            const response = await fetch(`${this.BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
    },

    // Legacy method name for backward compatibility
    apiRequest: async function(endpoint, options = {}) {
        console.log('⚠️ Using deprecated apiRequest method. Please use makeRequest instead.');
        return await this.makeRequest(endpoint, options);
    },

    // Set auth token (placeholder method for compatibility)
    setAuthToken: function(token) {
        if (token) {
            localStorage.setItem('accessToken', token);
        }
        // This method is for compatibility - actual token setting is handled in getAuthHeaders
        console.log('ℹ️ setAuthToken called. Tokens are automatically handled by getAuthHeaders().');
    }
};

// Initialize configuration when script loads
API_CONFIG.init();

// Legacy support - set global BASE_URL for existing code
window.BASE_URL = API_CONFIG.BASE_URL;

console.log('🚀 API Configuration loaded successfully');
console.log('BASE_URL set to:', window.BASE_URL);