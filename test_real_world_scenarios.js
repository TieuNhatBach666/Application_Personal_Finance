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
        
        // Map category names to IDs
        categories.forEach(cat => {
            categoryIds[cat.name] = cat.id;
        });
        
        return true;
    } else {
        console.log('❌ Không thể lấy danh mục:', result.error);
        return false;
    }
}

async function testScenario1_NegativeSavings() {
    console.log('\n🔴 SCENARIO 1: CHI TIÊU > THU NHẬP (TIẾT KIỆM ÂM)');
    console.log('=================================================');
    
    // Tạo giao dịch thu nhập thấp
    const lowIncome = {
        description: 'Thu nhập thấp tháng này',
        amount: 5000000, // 5 triệu
        type: 'Income',
        categoryId: categoryIds['Lương'],
        transactionDate: new Date().toISOString().split('T')[0]
    };
    
    // Tạo chi tiêu cao
    const highExpenses = [
        { description: 'Tiền nhà', amount: 3000000, categoryName: 'Nhà ở' },
        { description: 'Ăn uống', amount: 1500000, categoryName: 'Ăn uống' },
        { description: 'Đi lại', amount: 800000, categoryName: 'Đi lại' },
        { description: 'Mua sắm', amount: 1200000, categoryName: 'Mua sắm' },
    ];
    
    console.log('💰 Tạo thu nhập thấp:', lowIncome.amount.toLocaleString('vi-VN'), 'VND');
    await makeRequest('POST', '/transactions', lowIncome, true);
    
    console.log('💸 Tạo chi tiêu cao:');
    let totalExpense = 0;
    for (const expense of highExpenses) {
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
    
    console.log(`\n📊 Kết quả dự kiến:`);
    console.log(`   Thu nhập: ${lowIncome.amount.toLocaleString('vi-VN')} VND`);
    console.log(`   Chi tiêu: ${totalExpense.toLocaleString('vi-VN')} VND`);
    console.log(`   Tiết kiệm: ${(lowIncome.amount - totalExpense).toLocaleString('vi-VN')} VND (ÂM)`);
    
    // Kiểm tra summary
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const summaryResult = await makeRequest('GET', `/transactions/summary?startDate=${startDate}&endDate=${endDate}`, null, true);
    
    if (summaryResult.success) {
        const summary = summaryResult.data.data;
        console.log(`\n✅ Kết quả thực tế từ API:`);
        console.log(`   Thu nhập: ${summary.totalIncome?.toLocaleString('vi-VN')} VND`);
        console.log(`   Chi tiêu: ${summary.totalExpense?.toLocaleString('vi-VN')} VND`);
        console.log(`   Tiết kiệm: ${summary.netSavings?.toLocaleString('vi-VN')} VND`);
        
        if (summary.netSavings < 0) {
            console.log('🚨 CẢNH BÁO: Tiết kiệm âm - Cần cải thiện!');
            return { hasNegativeSavings: true, netSavings: summary.netSavings };
        }
    }
    
    return { hasNegativeSavings: false };
}

async function testScenario2_BudgetOverspend() {
    console.log('\n🔴 SCENARIO 2: VƯỢT NGÂN SÁCH');
    console.log('==============================');
    
    // Tạo ngân sách nhỏ
    const budgetData = {
        name: 'Ngân sách ăn uống test',
        categoryId: categoryIds['Ăn uống'],
        totalAmount: 500000, // 500k
        period: 'monthly',
        warningThreshold: 80,
        color: '#e74c3c'
    };
    
    console.log('💰 Tạo ngân sách:', budgetData.totalAmount.toLocaleString('vi-VN'), 'VND');
    const budgetResult = await makeRequest('POST', '/budgets', budgetData, true);
    
    if (budgetResult.success) {
        console.log('✅ Ngân sách đã tạo');
        
        // Tạo chi tiêu vượt ngân sách
        const overspendTransactions = [
            { description: 'Ăn sáng 1', amount: 200000 },
            { description: 'Ăn trưa 1', amount: 250000 },
            { description: 'Ăn tối 1', amount: 300000 }, // Tổng = 750k > 500k
        ];
        
        console.log('💸 Tạo chi tiêu vượt ngân sách:');
        let totalSpent = 0;
        for (const transaction of overspendTransactions) {
            const transactionData = {
                description: transaction.description,
                amount: transaction.amount,
                type: 'Expense',
                categoryId: categoryIds['Ăn uống'],
                transactionDate: new Date().toISOString().split('T')[0]
            };
            
            await makeRequest('POST', '/transactions', transactionData, true);
            totalSpent += transaction.amount;
            console.log(`   - ${transaction.description}: ${transaction.amount.toLocaleString('vi-VN')} VND`);
            
            // Delay để thấy progression
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n📊 Kết quả:`);
        console.log(`   Ngân sách: ${budgetData.totalAmount.toLocaleString('vi-VN')} VND`);
        console.log(`   Đã chi: ${totalSpent.toLocaleString('vi-VN')} VND`);
        console.log(`   Vượt: ${(totalSpent - budgetData.totalAmount).toLocaleString('vi-VN')} VND`);
        console.log(`   Tỷ lệ: ${((totalSpent / budgetData.totalAmount) * 100).toFixed(1)}%`);
        
        return { budgetExceeded: true, overspendAmount: totalSpent - budgetData.totalAmount };
    }
    
    return { budgetExceeded: false };
}

async function testScenario3_CheckBudgetSummary() {
    console.log('\n🔍 SCENARIO 3: KIỂM TRA TỔNG QUAN NGÂN SÁCH');
    console.log('===========================================');
    
    const summaryResult = await makeRequest('GET', '/budgets/summary/current', null, true);
    
    if (summaryResult.success) {
        const summary = summaryResult.data.data;
        console.log('✅ Tổng quan ngân sách:');
        console.log(`   Tổng số ngân sách: ${summary.totalBudgets}`);
        console.log(`   Tổng ngân sách: ${summary.totalBudgetAmount?.toLocaleString('vi-VN')} VND`);
        console.log(`   Tổng đã chi: ${summary.totalSpentAmount?.toLocaleString('vi-VN')} VND`);
        console.log(`   Tỷ lệ sử dụng: ${summary.averageUsagePercentage?.toFixed(1)}%`);
        console.log(`   Ngân sách gần vượt: ${summary.budgetsNearLimit}`);
        
        if (summary.totalBudgetAmount === 0) {
            console.log('🚨 VẤN ĐỀ: Tổng ngân sách = 0 - Cần kiểm tra!');
            return { totalBudgetZero: true };
        }
        
        return { totalBudgetZero: false, summary };
    } else {
        console.log('❌ Không thể lấy tổng quan ngân sách:', summaryResult.error);
        return { error: true };
    }
}

async function main() {
    console.log('🚀 KIỂM TRA CÁC TÌNH HUỐNG THỰC TẾ');
    console.log('==================================');
    console.log('Thời gian:', new Date().toLocaleTimeString('vi-VN'));
    
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Không thể đăng nhập - dừng test');
        return;
    }
    
    // Step 2: Get categories
    const categoriesSuccess = await getCategories();
    if (!categoriesSuccess) {
        console.log('\n❌ Không thể lấy danh mục - dừng test');
        return;
    }
    
    // Step 3: Test scenarios
    const scenario1 = await testScenario1_NegativeSavings();
    const scenario2 = await testScenario2_BudgetOverspend();
    const scenario3 = await testScenario3_CheckBudgetSummary();
    
    console.log('\n🏁 TÓM TẮT KẾT QUẢ');
    console.log('==================');
    
    if (scenario1.hasNegativeSavings) {
        console.log('🔴 Tiết kiệm âm:', scenario1.netSavings?.toLocaleString('vi-VN'), 'VND');
        console.log('   ➡️ Cần thêm cảnh báo và gợi ý cải thiện');
    }
    
    if (scenario2.budgetExceeded) {
        console.log('🔴 Vượt ngân sách:', scenario2.overspendAmount?.toLocaleString('vi-VN'), 'VND');
        console.log('   ➡️ Cần thông báo cảnh báo rõ ràng hơn');
    }
    
    if (scenario3.totalBudgetZero) {
        console.log('🔴 Tổng ngân sách = 0');
        console.log('   ➡️ Cần sửa logic tính toán');
    }
    
    console.log('\n📋 DANH SÁCH CẢI THIỆN CẦN THIẾT:');
    console.log('1. Thêm cảnh báo khi tiết kiệm âm');
    console.log('2. Cải thiện UI cho số âm (màu đỏ, icon cảnh báo)');
    console.log('3. Sửa bug tổng ngân sách = 0');
    console.log('4. Thêm gợi ý cải thiện tài chính');
    console.log('5. Thêm thông báo push khi vượt ngân sách');
}

main().catch(console.error);
