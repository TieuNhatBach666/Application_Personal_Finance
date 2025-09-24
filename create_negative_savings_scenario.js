const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
    email: 'testbudget2@example.com',
    password: 'Test123456'
};

let authToken = '';
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
        authToken = result.data.data?.accessToken || result.data.data?.token || result.data.accessToken || result.data.token;
        return true;
    } else {
        console.log('❌ Đăng nhập thất bại:', result.error);
        return false;
    }
}

async function getCategories() {
    const result = await makeRequest('GET', '/categories', null, true);
    
    if (result.success) {
        const categories = result.data.data;
        categories.forEach(cat => {
            categoryIds[cat.name] = cat.id;
        });
        return true;
    }
    return false;
}

async function clearAllTransactions() {
    console.log('🗑️ Xóa tất cả giao dịch cũ...');

    // Get all transactions
    const result = await makeRequest('GET', '/transactions', null, true);

    if (result.success && result.data.data && Array.isArray(result.data.data)) {
        const transactions = result.data.data;
        console.log(`   Tìm thấy ${transactions.length} giao dịch cần xóa`);

        for (const transaction of transactions) {
            await makeRequest('DELETE', `/transactions/${transaction.ID || transaction.id}`, null, true);
        }

        console.log('✅ Đã xóa tất cả giao dịch cũ');
    } else {
        console.log('   Không có giao dịch nào để xóa');
    }
}

async function createNegativeSavingsScenario() {
    console.log('\n💸 TẠO TÌNH HUỐNG TIẾT KIỆM ÂM');
    console.log('===============================');
    
    // Tạo thu nhập thấp
    const income = {
        description: 'Lương part-time',
        amount: 3000000, // 3 triệu
        type: 'Income',
        categoryId: categoryIds['Lương'],
        transactionDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('💰 Thu nhập:', income.amount.toLocaleString('vi-VN'), 'VND');
    await makeRequest('POST', '/transactions', income, true);
    
    // Tạo chi tiêu cao hơn thu nhập
    const expenses = [
        { description: 'Tiền nhà', amount: 2500000, categoryName: 'Nhà ở' },
        { description: 'Ăn uống', amount: 800000, categoryName: 'Ăn uống' },
        { description: 'Đi lại', amount: 400000, categoryName: 'Đi lại' },
        { description: 'Điện thoại', amount: 200000, categoryName: 'Hóa đơn' },
        { description: 'Mua quần áo', amount: 300000, categoryName: 'Quần áo' },
    ];
    
    let totalExpense = 0;
    console.log('💸 Chi tiêu:');
    for (const expense of expenses) {
        const expenseData = {
            description: expense.description,
            amount: expense.amount,
            type: 'Expense',
            categoryId: categoryIds[expense.categoryName],
            transactionDate: new Date().toISOString().split('T')[0]
        };
        
        await makeRequest('POST', '/transactions', expenseData, true);
        totalExpense += expense.amount;
        console.log(`   - ${expense.description}: ${expense.amount.toLocaleString('vi-VN')} VND`);
    }
    
    const netSavings = income.amount - totalExpense;
    
    console.log(`\n📊 KẾT QUẢ:`);
    console.log(`   Thu nhập: ${income.amount.toLocaleString('vi-VN')} VND`);
    console.log(`   Chi tiêu: ${totalExpense.toLocaleString('vi-VN')} VND`);
    console.log(`   Tiết kiệm: ${netSavings.toLocaleString('vi-VN')} VND`);
    
    if (netSavings < 0) {
        console.log('🚨 TIẾT KIỆM ÂM - Cần cảnh báo!');
        console.log(`   Thiếu hụt: ${Math.abs(netSavings).toLocaleString('vi-VN')} VND`);
    }
    
    // Kiểm tra API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const summaryResult = await makeRequest('GET', `/statistics/overview?startDate=${startDate}&endDate=${endDate}`, null, true);
    
    if (summaryResult.success) {
        const summary = summaryResult.data.data;
        console.log(`\n✅ Xác nhận từ API:`);
        console.log(`   Thu nhập: ${summary.totalIncome?.toLocaleString('vi-VN')} VND`);
        console.log(`   Chi tiêu: ${summary.totalExpense?.toLocaleString('vi-VN')} VND`);
        console.log(`   Tiết kiệm: ${summary.netSavings?.toLocaleString('vi-VN')} VND`);
        
        if (summary.netSavings < 0) {
            console.log('🎉 THÀNH CÔNG: Đã tạo tình huống tiết kiệm âm!');
            console.log('🌐 Bây giờ hãy mở browser để xem cảnh báo trên Dashboard và Statistics');
            return true;
        }
    }
    
    return false;
}

async function main() {
    console.log('🚀 TẠO TÌNH HUỐNG TIẾT KIỆM ÂM ĐỂ TEST CẢNH BÁO');
    console.log('================================================');
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
    
    // Step 3: Clear old data
    await clearAllTransactions();
    
    // Step 4: Create negative savings scenario
    const success = await createNegativeSavingsScenario();
    
    if (success) {
        console.log('\n🏁 HOÀN THÀNH');
        console.log('=============');
        console.log('✅ Đã tạo thành công tình huống tiết kiệm âm');
        console.log('🌐 Mở http://localhost:5175 để xem:');
        console.log('   - Dashboard: Thẻ "Tiết kiệm tháng này" màu đỏ với icon cảnh báo');
        console.log('   - Dashboard: Banner cảnh báo chi tiêu vượt thu nhập');
        console.log('   - Statistics: Tương tự với cảnh báo và gợi ý');
        console.log('   - Budget: Cảnh báo vượt ngân sách (nếu có)');
    } else {
        console.log('\n❌ Không thể tạo tình huống tiết kiệm âm');
    }
}

main().catch(console.error);
