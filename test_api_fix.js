// Test script to verify API configuration fixes
console.log('Testing API configuration...');

// Test 1: Check if API_CONFIG is properly initialized
if (typeof window !== 'undefined' && window.API_CONFIG) {
    console.log('✅ API_CONFIG is available');
    console.log('BASE_URL:', window.API_CONFIG.BASE_URL);
    
    // Test 2: Check if legacy apiRequest method exists
    if (typeof window.API_CONFIG.apiRequest === 'function') {
        console.log('✅ API_CONFIG.apiRequest method is available');
    } else {
        console.log('❌ API_CONFIG.apiRequest method is missing');
    }
    
    // Test 3: Check if makeRequest method exists
    if (typeof window.API_CONFIG.makeRequest === 'function') {
        console.log('✅ API_CONFIG.makeRequest method is available');
    } else {
        console.log('❌ API_CONFIG.makeRequest method is missing');
    }
    
    // Test 4: Check if getAuthHeaders method exists
    if (typeof window.API_CONFIG.getAuthHeaders === 'function') {
        console.log('✅ API_CONFIG.getAuthHeaders method is available');
    } else {
        console.log('❌ API_CONFIG.getAuthHeaders method is missing');
    }
    
} else {
    console.log('❌ API_CONFIG is not available');
}

// Test 5: Check if BASE_URL is still available for legacy support
if (typeof window !== 'undefined' && window.BASE_URL) {
    console.log('✅ Legacy BASE_URL is available:', window.BASE_URL);
} else {
    console.log('❌ Legacy BASE_URL is not available');
}

console.log('API configuration test completed!');