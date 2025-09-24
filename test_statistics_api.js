const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data - using existing user
const testUser = {
    email: 'testbudget2@example.com',
    password: 'Test123456'
};

let authToken = '';
let testUserId = '';

async function makeRequest(method, endpoint, data = null, useAuth = false) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (useAuth && authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500,
        };
    }
}

async function testLogin() {
    console.log('\n🔑 TEST: Đăng nhập để lấy token');
    console.log('=====================================');
    
    const result = await makeRequest('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });
    
    if (result.success) {
        console.log('✅ Đăng nhập thành công');
        testUserId = result.data.data?.user?.id || result.data.user?.id;
        authToken = result.data.data?.accessToken || result.data.data?.token || result.data.accessToken || result.data.token;
        console.log('   User ID:', testUserId);
        console.log('   Token:', authToken ? 'Có token' : 'Không có token');
        return true;
    } else {
        console.log('❌ Đăng nhập thất bại:', result.error);
        return false;
    }
}

async function testStatisticsAPI() {
    console.log('\n📊 TEST: Kiểm tra API thống kê');
    console.log('=====================================');
    
    // Test date range - current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    console.log(`📅 Khoảng thời gian: ${startDate} đến ${endDate}`);
    
    // Test 1: Overview statistics
    console.log('\n1️⃣ Test Overview Statistics:');
    const overviewResult = await makeRequest('GET', `/statistics/overview?startDate=${startDate}&endDate=${endDate}`, null, true);
    
    if (overviewResult.success) {
        console.log('✅ Overview API hoạt động');
        console.log('   Data:', JSON.stringify(overviewResult.data.data, null, 2));
    } else {
        console.log('❌ Overview API thất bại:', overviewResult.error);
    }
    
    // Test 2: Category breakdown
    console.log('\n2️⃣ Test Category Breakdown:');
    const categoryResult = await makeRequest('GET', `/statistics/by-category?startDate=${startDate}&endDate=${endDate}&type=Expense`, null, true);
    
    if (categoryResult.success) {
        console.log('✅ Category API hoạt động');
        const categories = categoryResult.data.data.categories;
        console.log(`   Số danh mục: ${categories.length}`);
        
        if (categories.length > 0) {
            console.log('   📋 Dữ liệu thực từ database:');
            categories.forEach((cat, index) => {
                console.log(`      ${index + 1}. ${cat.name}: ${cat.amount.toLocaleString('vi-VN')} VND (${cat.percentage}%)`);
            });
        } else {
            console.log('   ⚠️ Không có dữ liệu thực - sẽ dùng mock data');
        }
    } else {
        console.log('❌ Category API thất bại:', categoryResult.error);
    }
    
    // Test 3: Trends
    console.log('\n3️⃣ Test Trends Statistics:');
    const trendsResult = await makeRequest('GET', `/statistics/trends?startDate=${startDate}&endDate=${endDate}&period=month`, null, true);
    
    if (trendsResult.success) {
        console.log('✅ Trends API hoạt động');
        console.log('   Data:', JSON.stringify(trendsResult.data.data, null, 2));
    } else {
        console.log('❌ Trends API thất bại:', trendsResult.error);
    }
}

async function checkTransactionData() {
    console.log('\n💰 TEST: Kiểm tra dữ liệu giao dịch');
    console.log('=====================================');
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const summaryResult = await makeRequest('GET', `/transactions/summary?startDate=${startDate}&endDate=${endDate}`, null, true);
    
    if (summaryResult.success) {
        const summary = summaryResult.data.data;
        console.log('✅ Transaction Summary API hoạt động');
        console.log('   📊 Tổng quan tháng này:');
        console.log(`      💰 Thu nhập: ${summary.totalIncome?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`      💸 Chi tiêu: ${summary.totalExpense?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`      💎 Tiết kiệm: ${summary.netSavings?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`      📝 Số giao dịch: ${summary.transactionCount || 0}`);
        
        if (summary.transactionCount > 0) {
            console.log('   ✅ CÓ DỮ LIỆU THỰC - Thống kê sẽ hiển thị dữ liệu từ database');
        } else {
            console.log('   ⚠️ KHÔNG CÓ DỮ LIỆU THỰC - Thống kê sẽ hiển thị mock data');
        }
    } else {
        console.log('❌ Transaction Summary thất bại:', summaryResult.error);
    }
}

async function main() {
    console.log('🚀 BẮT ĐẦU KIỂM TRA CHỨC NĂNG THỐNG KÊ');
    console.log('=====================================');
    console.log('Thời gian:', new Date().toLocaleTimeString('vi-VN'));
    
    // Step 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log('\n❌ Không thể đăng nhập - dừng test');
        return;
    }
    
    // Step 2: Check transaction data
    await checkTransactionData();
    
    // Step 3: Test statistics APIs
    await testStatisticsAPI();
    
    console.log('\n🏁 KẾT QUẢ KIỂM TRA');
    console.log('==================');
    console.log('✅ Kiểm tra hoàn tất - xem kết quả ở trên');
}

main().catch(console.error);
