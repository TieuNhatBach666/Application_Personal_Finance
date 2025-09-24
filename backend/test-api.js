// Quick API test script
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    try {
        console.log('🔄 Testing Personal Finance API...\n');
        
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ Health check:', healthResponse.data.message);
        
        // Test user registration
        console.log('\n2. Testing user registration...');
        const registerData = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            phoneNumber: '0123456789'
        };
        
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
        console.log('✅ Registration successful:', registerResponse.data.message);
        
        const { accessToken, user } = registerResponse.data.data;
        console.log('👤 User created:', user.firstName, user.lastName);
        
        // Test login
        console.log('\n3. Testing user login...');
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ Login successful:', loginResponse.data.message);
        
        // Test get user profile
        console.log('\n4. Testing get user profile...');
        const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ Profile retrieved:', profileResponse.data.data.email);
        
        // Test get categories
        console.log('\n5. Testing get categories...');
        const categoriesResponse = await axios.get(`${API_BASE}/categories`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ Categories retrieved:', categoriesResponse.data.data.length, 'categories');
        
        // Show some categories
        const categories = categoriesResponse.data.data;
        console.log('📋 Sample categories:');
        categories.slice(0, 5).forEach(cat => {
            console.log(`   ${cat.type}: ${cat.name} (${cat.icon}, ${cat.color})`);
        });
        
        // Test create new category
        console.log('\n6. Testing create new category...');
        const newCategoryData = {
            name: 'Test Category',
            type: 'Expense',
            icon: 'test',
            color: '#ff0000'
        };
        
        const createCategoryResponse = await axios.post(`${API_BASE}/categories`, newCategoryData, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('✅ Category created:', createCategoryResponse.data.data.name);
        
        console.log('\n🎉 All API tests passed successfully!');
        
    } catch (error) {
        console.error('❌ API test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run tests
testAPI();