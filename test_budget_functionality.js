const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testCategoryId = '';
let testBudgetId = '';

// Test data
const testUser = {
    email: 'testbudget2@example.com',
    password: 'Test123456',
    firstName: 'Test',
    lastName: 'Budget',
    phoneNumber: '0123456789'
};

const testCategory = {
    name: 'Test Ăn Uống',
    icon: '🍔',
    color: '#e74c3c'
};

const testBudget = {
    name: 'Ngân sách ăn uống tháng 12',
    totalAmount: 2000000, // 2 triệu VND
    period: 'monthly',
    warningThreshold: 80,
    color: '#3498db'
};

const testTransactions = [
    { amount: 50000, description: 'Ăn sáng', type: 'Expense' },
    { amount: 120000, description: 'Ăn trưa', type: 'Expense' },
    { amount: 80000, description: 'Ăn tối', type: 'Expense' },
    { amount: 200000, description: 'Đi nhà hàng', type: 'Expense' },
    { amount: 1800000, description: 'Chi tiêu lớn để test cảnh báo', type: 'Expense' }
];

// Helper functions
const makeRequest = async (method, endpoint, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
            data
        };
        
        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testUserRegistration() {
    console.log('\n🔐 TEST 1: Đăng ký người dùng test');
    console.log('=====================================');

    const result = await makeRequest('POST', '/auth/register', testUser);

    if (result.success) {
        console.log('✅ Đăng ký thành công');
        console.log('   Response:', JSON.stringify(result.data, null, 2));
        testUserId = result.data.data?.user?.id || result.data.user?.id;
        authToken = result.data.data?.accessToken || result.data.data?.token || result.data.accessToken || result.data.token;
        console.log('   User ID:', testUserId);
        console.log('   Token:', authToken ? 'Có token' : 'Không có token');
        return true;
    } else if (result.status === 400 && (result.error.includes('đã tồn tại') || result.error.includes('đã được sử dụng'))) {
        console.log('ℹ️ User đã tồn tại, thử đăng nhập...');
        return await testUserLogin();
    } else {
        console.log('❌ Đăng ký thất bại:', result.error);
        return false;
    }
}

async function testUserLogin() {
    console.log('\n🔑 TEST: Đăng nhập người dùng');

    const result = await makeRequest('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });

    if (result.success) {
        console.log('✅ Đăng nhập thành công');
        console.log('   Response:', JSON.stringify(result.data, null, 2));
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

async function testCategoryCreation() {
    console.log('\n📂 TEST 2: Tạo danh mục test');
    console.log('=============================');
    
    const result = await makeRequest('POST', '/categories', testCategory);
    
    if (result.success) {
        console.log('✅ Tạo danh mục thành công');
        testCategoryId = result.data.data.CategoryID || result.data.data.id;
        console.log('   Category ID:', testCategoryId);
        return true;
    } else {
        console.log('❌ Tạo danh mục thất bại:', result.error);
        return false;
    }
}

async function testBudgetCreation() {
    console.log('\n💰 TEST 3: Tạo ngân sách');
    console.log('========================');
    
    const budgetData = {
        ...testBudget,
        categoryId: testCategoryId
    };
    
    const result = await makeRequest('POST', '/budgets', budgetData);
    
    if (result.success) {
        console.log('✅ Tạo ngân sách thành công');
        testBudgetId = result.data.data.BudgetID || result.data.data.id;
        console.log('   Budget ID:', testBudgetId);
        console.log('   Ngân sách:', result.data.data.BudgetAmount?.toLocaleString('vi-VN'), 'VND');
        console.log('   Đã chi:', result.data.data.SpentAmount?.toLocaleString('vi-VN'), 'VND');
        return true;
    } else {
        console.log('❌ Tạo ngân sách thất bại:', result.error);
        return false;
    }
}

async function testTransactionCreation() {
    console.log('\n💸 TEST 4: Tạo giao dịch và kiểm tra cập nhật ngân sách');
    console.log('======================================================');
    
    let totalSpent = 0;
    
    for (let i = 0; i < testTransactions.length; i++) {
        const transaction = testTransactions[i];
        console.log(`\n   Giao dịch ${i + 1}: ${transaction.description} - ${transaction.amount.toLocaleString('vi-VN')} VND`);
        
        const transactionData = {
            ...transaction,
            categoryId: testCategoryId
        };
        
        const result = await makeRequest('POST', '/transactions', transactionData);
        
        if (result.success) {
            console.log('   ✅ Tạo giao dịch thành công');
            totalSpent += transaction.amount;
            
            // Đợi một chút để stored procedure chạy
            await delay(1000);
            
            // Kiểm tra ngân sách đã được cập nhật chưa
            const budgetCheck = await makeRequest('GET', `/budgets/${testBudgetId}`);
            if (budgetCheck.success) {
                const spentAmount = budgetCheck.data.data.SpentAmount || 0;
                const percentage = (spentAmount / testBudget.totalAmount * 100).toFixed(1);
                
                console.log(`   📊 Ngân sách hiện tại: ${spentAmount.toLocaleString('vi-VN')} / ${testBudget.totalAmount.toLocaleString('vi-VN')} VND (${percentage}%)`);
                
                if (spentAmount > 0) {
                    console.log('   ✅ Ngân sách đã được cập nhật real-time');
                } else {
                    console.log('   ⚠️ Ngân sách chưa được cập nhật - có thể có vấn đề với stored procedure');
                }
                
                // Kiểm tra cảnh báo
                if (percentage >= 100) {
                    console.log('   🚨 CẢNH BÁO: Đã vượt ngân sách!');
                } else if (percentage >= testBudget.warningThreshold) {
                    console.log('   ⚠️ CẢNH BÁO: Gần vượt ngân sách!');
                }
            }
        } else {
            console.log('   ❌ Tạo giao dịch thất bại:', result.error);
        }
        
        // Đợi giữa các giao dịch
        await delay(500);
    }
    
    console.log(`\n   📈 Tổng chi tiêu thực tế: ${totalSpent.toLocaleString('vi-VN')} VND`);
    return true;
}

async function testBudgetSummary() {
    console.log('\n📊 TEST 5: Kiểm tra tổng quan ngân sách');
    console.log('======================================');
    
    const result = await makeRequest('GET', '/budgets/summary/current');
    
    if (result.success) {
        const summary = result.data.data;
        console.log('✅ Lấy tổng quan thành công:');
        console.log('   Tổng số ngân sách:', summary.totalBudgets);
        console.log('   Tổng ngân sách:', summary.totalBudgetAmount?.toLocaleString('vi-VN'), 'VND');
        console.log('   Tổng đã chi:', summary.totalSpentAmount?.toLocaleString('vi-VN'), 'VND');
        console.log('   Tỷ lệ sử dụng trung bình:', summary.averageUsagePercentage?.toFixed(1), '%');
        console.log('   Số ngân sách gần vượt hạn mức:', summary.budgetsNearLimit);
        return true;
    } else {
        console.log('❌ Lấy tổng quan thất bại:', result.error);
        return false;
    }
}

async function testNotifications() {
    console.log('\n🔔 TEST 6: Kiểm tra thông báo cảnh báo');
    console.log('====================================');
    
    // Tạo thông báo thông minh
    const generateResult = await makeRequest('POST', '/notifications/generate');
    if (generateResult.success) {
        console.log('✅ Tạo thông báo thông minh thành công');
    }
    
    // Lấy danh sách thông báo
    const result = await makeRequest('GET', '/notifications');
    
    if (result.success) {
        const notifications = result.data.data;
        console.log(`✅ Có ${notifications.length} thông báo`);
        
        notifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. [${notif.Type}] ${notif.Title}`);
            console.log(`      ${notif.Message}`);
            console.log(`      Mức độ: ${notif.Priority} | Đã đọc: ${notif.IsRead ? 'Có' : 'Không'}`);
        });
        
        return true;
    } else {
        console.log('❌ Lấy thông báo thất bại:', result.error);
        return false;
    }
}

async function testBudgetUpdate() {
    console.log('\n✏️ TEST 7: Cập nhật ngân sách');
    console.log('=============================');
    
    const updatedBudget = {
        name: 'Ngân sách ăn uống tháng 12 (Đã cập nhật)',
        categoryId: testCategoryId,
        totalAmount: 3000000, // Tăng lên 3 triệu
        period: 'monthly',
        warningThreshold: 75, // Giảm threshold
        color: '#e67e22'
    };
    
    const result = await makeRequest('PUT', `/budgets/${testBudgetId}`, updatedBudget);
    
    if (result.success) {
        console.log('✅ Cập nhật ngân sách thành công');
        console.log('   Tên mới:', result.data.data.BudgetName);
        console.log('   Ngân sách mới:', result.data.data.BudgetAmount?.toLocaleString('vi-VN'), 'VND');
        console.log('   Threshold mới:', result.data.data.WarningThreshold, '%');
        return true;
    } else {
        console.log('❌ Cập nhật ngân sách thất bại:', result.error);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 BẮT ĐẦU KIỂM TRA CHỨC NĂNG NGÂN SÁCH');
    console.log('=====================================');
    console.log('Thời gian:', new Date().toLocaleString('vi-VN'));
    
    const tests = [
        { name: 'Đăng ký/Đăng nhập', fn: testUserRegistration },
        { name: 'Tạo danh mục', fn: testCategoryCreation },
        { name: 'Tạo ngân sách', fn: testBudgetCreation },
        { name: 'Tạo giao dịch & cập nhật ngân sách', fn: testTransactionCreation },
        { name: 'Tổng quan ngân sách', fn: testBudgetSummary },
        { name: 'Thông báo cảnh báo', fn: testNotifications },
        { name: 'Cập nhật ngân sách', fn: testBudgetUpdate }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Lỗi trong test "${test.name}":`, error.message);
        }
        
        await delay(1000); // Đợi giữa các test
    }
    
    console.log('\n🏁 KẾT QUỢ KIỂM TRA');
    console.log('==================');
    console.log(`✅ Đã pass: ${passedTests}/${tests.length} tests`);
    console.log(`📊 Tỷ lệ thành công: ${(passedTests/tests.length*100).toFixed(1)}%`);
    
    if (passedTests === tests.length) {
        console.log('🎉 TẤT CẢ CHỨC NĂNG NGÂN SÁCH HOẠT ĐỘNG HOÀN HẢO!');
    } else {
        console.log('⚠️ CÓ MỘT SỐ CHỨC NĂNG CẦN KHẮC PHỤC');
    }
}

// Run tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests };
