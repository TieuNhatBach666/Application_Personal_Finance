const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
    email: 'testbudget2@example.com',
    password: 'Test123456'
};

let authToken = '';
let testUserId = '';
let categoryIds = {};

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

async function login() {
    console.log('🔑 Đăng nhập...');
    
    const result = await makeRequest('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });
    
    if (result.success) {
        console.log('✅ Đăng nhập thành công');
        testUserId = result.data.data?.user?.id || result.data.user?.id;
        authToken = result.data.data?.accessToken || result.data.data?.token || result.data.accessToken || result.data.token;
        return true;
    } else {
        console.log('❌ Đăng nhập thất bại:', result.error);
        return false;
    }
}

async function getCategories() {
    console.log('\n📂 Lấy danh sách danh mục...');
    
    const result = await makeRequest('GET', '/categories', null, true);
    
    if (result.success) {
        const categories = result.data.data;
        console.log(`✅ Tìm thấy ${categories.length} danh mục`);
        
        // Debug: show category structure
        console.log('   Sample category:', JSON.stringify(categories[0], null, 2));

        // Map category names to IDs
        categories.forEach(cat => {
            categoryIds[cat.Name || cat.name] = cat.ID || cat.id;
        });

        console.log('   Danh mục có sẵn:', Object.keys(categoryIds).join(', '));
        return true;
    } else {
        console.log('❌ Không thể lấy danh mục:', result.error);
        return false;
    }
}

async function createTestTransactions() {
    console.log('\n💰 Tạo dữ liệu giao dịch test...');
    
    // Sample transactions for this month
    const transactions = [
        // Income
        { description: 'Lương tháng 9', amount: 15000000, type: 'Income', categoryName: 'Lương' },
        { description: 'Thưởng dự án', amount: 3000000, type: 'Income', categoryName: 'Thưởng' },
        
        // Expenses
        { description: 'Ăn sáng', amount: 50000, type: 'Expense', categoryName: 'Ăn uống' },
        { description: 'Ăn trưa', amount: 120000, type: 'Expense', categoryName: 'Ăn uống' },
        { description: 'Ăn tối', amount: 80000, type: 'Expense', categoryName: 'Ăn uống' },
        { description: 'Cà phê', amount: 45000, type: 'Expense', categoryName: 'Ăn uống' },
        { description: 'Nhà hàng cuối tuần', amount: 500000, type: 'Expense', categoryName: 'Ăn uống' },
        
        { description: 'Xăng xe', amount: 200000, type: 'Expense', categoryName: 'Đi lại' },
        { description: 'Grab', amount: 150000, type: 'Expense', categoryName: 'Đi lại' },
        { description: 'Vé xe buýt', amount: 30000, type: 'Expense', categoryName: 'Đi lại' },
        
        { description: 'Mua sách', amount: 300000, type: 'Expense', categoryName: 'Học tập' },
        { description: 'Khóa học online', amount: 500000, type: 'Expense', categoryName: 'Học tập' },
        
        { description: 'Xem phim', amount: 200000, type: 'Expense', categoryName: 'Giải trí' },
        { description: 'Game', amount: 100000, type: 'Expense', categoryName: 'Giải trí' },
        
        { description: 'Tiền điện', amount: 800000, type: 'Expense', categoryName: 'Hóa đơn' },
        { description: 'Tiền nước', amount: 150000, type: 'Expense', categoryName: 'Hóa đơn' },
        { description: 'Internet', amount: 300000, type: 'Expense', categoryName: 'Hóa đơn' },
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const transaction of transactions) {
        // Find category ID
        const categoryId = categoryIds[transaction.categoryName];
        if (!categoryId) {
            console.log(`⚠️ Không tìm thấy danh mục: ${transaction.categoryName}`);
            failCount++;
            continue;
        }
        
        // Create transaction
        const transactionData = {
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: categoryId,
            transactionDate: new Date().toISOString().split('T')[0] // Today's date
        };
        
        const result = await makeRequest('POST', '/transactions', transactionData, true);
        
        if (result.success) {
            console.log(`✅ ${transaction.description}: ${transaction.amount.toLocaleString('vi-VN')} VND`);
            successCount++;
        } else {
            console.log(`❌ ${transaction.description}: ${result.error}`);
            failCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Kết quả tạo dữ liệu:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ❌ Thất bại: ${failCount}`);
    
    return successCount > 0;
}

async function testStatisticsAfterData() {
    console.log('\n📈 Kiểm tra thống kê sau khi có dữ liệu...');
    
    // Wait a bit for data to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Test summary
    const summaryResult = await makeRequest('GET', `/transactions/summary?startDate=${startDate}&endDate=${endDate}`, null, true);
    
    if (summaryResult.success) {
        const summary = summaryResult.data.data;
        console.log('✅ Tổng quan tài chính:');
        console.log(`   💰 Thu nhập: ${summary.totalIncome?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`   💸 Chi tiêu: ${summary.totalExpense?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`   💎 Tiết kiệm: ${summary.netSavings?.toLocaleString('vi-VN') || 0} VND`);
        console.log(`   📝 Số giao dịch: ${summary.transactionCount || 0}`);
    }
    
    // Test category breakdown
    const categoryResult = await makeRequest('GET', `/statistics/by-category?startDate=${startDate}&endDate=${endDate}&type=Expense`, null, true);
    
    if (categoryResult.success) {
        const categories = categoryResult.data.data.categories;
        console.log(`\n✅ Phân tích chi tiêu theo danh mục (${categories.length} danh mục):`);
        
        categories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name}: ${cat.amount.toLocaleString('vi-VN')} VND (${cat.percentage}%)`);
        });
        
        if (categories.length > 0) {
            console.log('\n🎉 THỐNG KÊ HIỆN TẠI SỬ DỤNG DỮ LIỆU THỰC TỪ DATABASE!');
        }
    }
}

async function main() {
    console.log('🚀 TẠO DỮ LIỆU TEST CHO THỐNG KÊ');
    console.log('================================');
    console.log('Thời gian:', new Date().toLocaleTimeString('vi-VN'));
    
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Không thể đăng nhập - dừng');
        return;
    }
    
    // Step 2: Get categories
    const categoriesSuccess = await getCategories();
    if (!categoriesSuccess) {
        console.log('\n❌ Không thể lấy danh mục - dừng');
        return;
    }
    
    // Step 3: Create test transactions
    const dataSuccess = await createTestTransactions();
    if (!dataSuccess) {
        console.log('\n❌ Không thể tạo dữ liệu test');
        return;
    }
    
    // Step 4: Test statistics with real data
    await testStatisticsAfterData();
    
    console.log('\n🏁 HOÀN THÀNH');
    console.log('=============');
    console.log('✅ Bây giờ trang Thống kê sẽ hiển thị dữ liệu thực thay vì mock data!');
    console.log('🌐 Hãy mở browser và kiểm tra trang Statistics');
}

main().catch(console.error);
