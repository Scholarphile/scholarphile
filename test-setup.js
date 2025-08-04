#!/usr/bin/env node

/**
 * Scholarphile Enhanced Setup Test Script
 * 
 * This script tests the enhanced functionality to ensure everything is working properly.
 * Run with: node test-setup.js
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
    baseUrl: 'http://localhost:8787', // Change to your deployed URL
    testUser: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
    }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https:') ? https : http;
        const req = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        status: res.statusCode,
                        headers: res.headers,
                        data: data ? JSON.parse(data) : null
                    };
                    resolve(result);
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name} ${message}`);
    
    results.tests.push({ name, passed, message });
    if (passed) {
        results.passed++;
    } else {
        results.failed++;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Scholarphile Enhanced Setup Tests\n');
    
    let authToken = null;
    let userId = null;
    
    try {
        // Test 1: Health Check
        console.log('📋 Testing Basic Connectivity...');
        try {
            const health = await makeRequest(`${config.baseUrl}/health`);
            logTest('Health Check', health.status === 200, `Status: ${health.status}`);
            
            if (health.data) {
                logTest('Database Connection', !!health.data.databases?.d1, 'D1 Database');
                logTest('Storage Connection', !!health.data.databases?.r2, 'R2 Storage');
                logTest('Version Check', !!health.data.version, `Version: ${health.data.version}`);
            }
        } catch (error) {
            logTest('Health Check', false, `Error: ${error.message}`);
        }
        
        // Test 2: Debug Endpoint
        console.log('\n🐛 Testing Debug Functionality...');
        try {
            const debug = await makeRequest(`${config.baseUrl}/debug`, {
                method: 'GET',
                headers: { 'X-Debug-Mode': 'true' }
            });
            logTest('Debug Endpoint', debug.status === 200 || debug.status === 404, `Status: ${debug.status}`);
        } catch (error) {
            logTest('Debug Endpoint', false, `Error: ${error.message}`);
        }
        
        // Test 3: User Registration
        console.log('\n👤 Testing Authentication...');
        try {
            const register = await makeRequest(`${config.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config.testUser)
            });
            
            if (register.status === 200 && register.data.token) {
                authToken = register.data.token;
                userId = register.data.user.id;
                logTest('User Registration', true, 'Successfully created test user');
            } else {
                logTest('User Registration', false, `Status: ${register.status}, ${register.data?.error || 'Unknown error'}`);
            }
        } catch (error) {
            logTest('User Registration', false, `Error: ${error.message}`);
        }
        
        // Test 4: User Login (alternative)
        if (!authToken) {
            try {
                const login = await makeRequest(`${config.baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: config.testUser.email,
                        password: config.testUser.password
                    })
                });
                
                if (login.status === 200 && login.data.token) {
                    authToken = login.data.token;
                    userId = login.data.user.id;
                    logTest('User Login', true, 'Successfully logged in existing user');
                } else {
                    logTest('User Login', false, `Status: ${login.status}`);
                }
            } catch (error) {
                logTest('User Login', false, `Error: ${error.message}`);
            }
        }
        
        // Test 5: Authenticated Requests
        if (authToken) {
            console.log('\n🔐 Testing Authenticated Endpoints...');
            
            // Test /api/auth/me
            try {
                const me = await makeRequest(`${config.baseUrl}/api/auth/me`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                logTest('Get Current User', me.status === 200, `User: ${me.data?.user?.name}`);
            } catch (error) {
                logTest('Get Current User', false, `Error: ${error.message}`);
            }
            
            // Test /api/documents
            try {
                const docs = await makeRequest(`${config.baseUrl}/api/documents`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                logTest('List Documents', docs.status === 200, `Found: ${docs.data?.documents?.length || 0} documents`);
            } catch (error) {
                logTest('List Documents', false, `Error: ${error.message}`);
            }
            
            // Test /api/recommendations
            try {
                const recommendations = await makeRequest(`${config.baseUrl}/api/recommendations`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                logTest('Get Recommendations', recommendations.status === 200, `Algorithm: ${recommendations.data?.algorithm}`);
            } catch (error) {
                logTest('Get Recommendations', false, `Error: ${error.message}`);
            }
            
            // Test /api/analytics
            try {
                const analytics = await makeRequest(`${config.baseUrl}/api/analytics`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                logTest('Get Analytics', analytics.status === 200, 'Analytics data retrieved');
            } catch (error) {
                logTest('Get Analytics', false, `Error: ${error.message}`);
            }
        }
        
        // Test 6: Search Functionality
        console.log('\n🔍 Testing Search...');
        try {
            const search = await makeRequest(`${config.baseUrl}/api/search?q=test`, {
                method: 'GET',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            logTest('Search Documents', search.status === 200, `Found: ${search.data?.results?.length || 0} results`);
        } catch (error) {
            logTest('Search Documents', false, `Error: ${error.message}`);
        }
        
        // Test 7: CORS Headers
        console.log('\n🌐 Testing CORS Configuration...');
        try {
            const options = await makeRequest(`${config.baseUrl}/api/documents`, {
                method: 'OPTIONS'
            });
            const hasCors = options.headers['access-control-allow-origin'] === '*';
            logTest('CORS Headers', hasCors, `CORS: ${hasCors ? 'Enabled' : 'Disabled'}`);
        } catch (error) {
            logTest('CORS Headers', false, `Error: ${error.message}`);
        }
        
        // Test 8: Error Handling
        console.log('\n❗ Testing Error Handling...');
        try {
            const error404 = await makeRequest(`${config.baseUrl}/api/nonexistent`);
            logTest('404 Error Handling', error404.status === 404, `Status: ${error404.status}`);
        } catch (error) {
            logTest('404 Error Handling', false, `Error: ${error.message}`);
        }
        
        // Test 9: Debug Headers
        if (authToken) {
            try {
                const debugRequest = await makeRequest(`${config.baseUrl}/api/documents`, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'X-Debug-Mode': 'true'
                    }
                });
                const hasDebugHeaders = !!debugRequest.headers['x-debug-info'];
                logTest('Debug Headers', hasDebugHeaders, `Debug info: ${hasDebugHeaders ? 'Present' : 'Missing'}`);
            } catch (error) {
                logTest('Debug Headers', false, `Error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('Test runner error:', error);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.passed).forEach(test => {
            console.log(`  - ${test.name}: ${test.message}`);
        });
        
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Ensure Cloudflare Worker is running (npm run worker:dev)');
        console.log('2. Check database migrations are applied (npm run db:migrate)');
        console.log('3. Verify wrangler.toml configuration');
        console.log('4. Check browser console for frontend errors');
        console.log('5. Review the SETUP.md file for detailed instructions');
    } else {
        console.log('\n🎉 All tests passed! Your Scholarphile enhanced setup is working perfectly!');
        console.log('\n📖 Next Steps:');
        console.log('1. Open your browser and navigate to the frontend');
        console.log('2. Register a new account or use the test account');
        console.log('3. Upload some test documents');
        console.log('4. Try the search and recommendation features');
        console.log('5. Enable debug mode to see the enhanced functionality');
    }
    
    console.log('\n📚 For more information, see SETUP.md');
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };