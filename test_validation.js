const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testValidationFixes() {
  console.log('Testing validation fixes...\n');

  // Test 1: User registration with correct role
  try {
    const userData = {
      username: "testuser123",
      email: "test@example.com",
      password: "password123",
      role: "Admin"  // Using correct case
    };

    console.log('1. Testing user registration with correct role case...');
    const userResponse = await axios.post(`${BASE_URL}/v1/auth/register`, userData);
    console.log('✅ User registration successful:', userResponse.data.success);
  } catch (error) {
    console.log('❌ User registration failed:', error.response?.data?.message || error.message);
  }

  // Test 2: AI Chat endpoint (both routes)
  try {
    const chatData = {
      message: "Hello, what services do you offer?",
      context: "General inquiry about company services"
    };

    console.log('\n2. Testing AI chat endpoint (/chat)...');
    const chatResponse = await axios.post(`${BASE_URL}/v1/ai/chat`, chatData);
    console.log('✅ AI chat worked successfully');
  } catch (error) {
    console.log('❌ AI chat failed:', error.response?.data?.message || error.message);
  }

  // Test 3: AI Assistant endpoint with correct field name
  try {
    const assistantData = {
      query: "I need help with a web development project for my e-commerce business",
      preferences: {
        budget: "$10k-$50k",
        timeline: "3-6 months",
        projectType: "Website",
        industry: "E-commerce"
      }
    };

    console.log('\n3. Testing AI assistant endpoint with correct query field...');
    const assistantResponse = await axios.post(`${BASE_URL}/v1/ai/assistant`, assistantData);
    console.log('✅ AI assistant worked successfully');
  } catch (error) {
    console.log('❌ AI assistant failed:', error.response?.data?.message || error.message);
  }

  // Test 4: Team member with flexible phone number
  try {
    const teamMemberData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      position: "Developer",
      skills: ["JavaScript", "Node.js"]
    };

    console.log('\n4. Testing team member creation with flexible phone format...');
    const teamResponse = await axios.post(`${BASE_URL}/team-members`, teamMemberData);
    console.log('✅ Team member created successfully:', teamResponse.data.data._id);
  } catch (error) {
    console.log('❌ Team member creation failed:', error.response?.data?.message || error.message);
  }

  // Test 5: Project with correct category
  try {
    const projectData = {
      title: "Test Website Project",
      fullDescription: "A comprehensive test website project",
      shortDescription: "Test project for validation",
      category: "Website",  // Using correct enum value
      technologies: ["HTML", "CSS", "JavaScript"]
    };

    console.log('\n5. Testing project creation with correct category enum...');
    const projectResponse = await axios.post(`${BASE_URL}/projects`, projectData);
    console.log('✅ Project created successfully:', projectResponse.data.data._id);
  } catch (error) {
    console.log('❌ Project creation failed:', error.response?.data?.message || error.message);
  }

  console.log('\nValidation test completed!');
}

// Wait for server to be ready and then run tests
setTimeout(testValidationFixes, 2000);