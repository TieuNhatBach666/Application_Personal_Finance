import { useAppSelector } from '../store';
import { formatCurrencyCompact, formatCurrencyFull } from '../utils/formatCurrency';

export const useUserSettings = () => {
  const { settings } = useAppSelector((state) => state.settings);

  // Get current settings with defaults
  const theme = settings?.appearance?.theme || 'light';
  const language = settings?.appearance?.language || 'vi';
  const currency = settings?.appearance?.currency || 'VND';

  // Currency formatting functions with user's currency
  const formatCompact = (amount: number) => formatCurrencyCompact(amount, currency);
  const formatFull = (amount: number) => formatCurrencyFull(amount, currency);

  // Language-specific text
  const getText = (key: string) => {
    const texts = {
      vi: {
        // Common
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        add: 'Thêm',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        
        // Dashboard
        dashboard: 'Tổng quan',
        totalIncome: 'Tổng thu nhập',
        totalExpense: 'Tổng chi tiêu',
        balance: 'Số dư',
        welcome: 'Chào mừng',
        warningTitle: 'Cảnh báo: Chi tiêu vượt thu nhập!',
        warningMessage: 'Bạn đang chi tiêu nhiều hơn thu nhập. Số tiền thiếu hụt:',
        suggestions: 'Gợi ý cải thiện:',
        reduceExpenses: 'Giảm chi tiêu không cần thiết',
        increaseIncome: 'Tìm thêm nguồn thu nhập',
        reviewBudget: 'Xem lại ngân sách',
        totalExpensesLabel: 'Tổng chi tiêu:',
        viewDetailedStats: 'Xem chi tiết thống kê',

        // Transactions
        transactions: 'Giao dịch',
        income: 'Thu nhập',
        expense: 'Chi tiêu',
        category: 'Danh mục',
        amount: 'Số tiền',
        date: 'Ngày',
        description: 'Mô tả',

        // Navigation
        statistics: 'Thống kê',
        budget: 'Ngân sách',
        notifications: 'Cảnh báo',

        // Transaction List Page
        transactionListTitle: 'Danh Sách Giao Dịch',
        transactionListSubtitle: 'Quản lý tất cả thu chi của bạn',
        addIncome: 'Thêm Thu Nhập',
        addExpense: 'Thêm Chi Tiêu',
        searchTransactions: 'Tìm kiếm giao dịch...',
        type: 'Loại',
        filterButton: 'LỌC',
        actions: 'Thao tác',

        // Add Transaction Page
        addTransactionTitle: 'Thêm Giao Dịch',
        addTransactionSubtitle: 'Ghi lại thu nhập hoặc chi tiêu của bạn',
        saveTransaction: 'Lưu Giao Dịch',
        saving: 'Đang lưu...',

        // Statistics Page
        statisticsTitle: 'Thống Kê & Báo Cáo',
        statisticsSubtitle: 'Phân tích chi tiết tình hình tài chính của bạn',
        exportReport: 'Xuất Báo Cáo',
        expensesByCategory: 'Chi Tiêu Theo Danh Mục',
        loadingStats: 'Đang tải dữ liệu thống kê...',
        noStatsData: 'Chưa có dữ liệu thống kê',
        noStatsMessage: 'Hãy tạo một số giao dịch để xem biểu đồ thống kê chi tiêu theo danh mục',
        analyzeExpensesByCategory: 'Phân tích chi tiêu theo danh mục',
        thisMonth: 'Tháng này',
        thisWeek: 'Tuần này',
        thisYear: 'Năm này',

        // Dashboard sections
        incomeThisMonth: 'Thu nhập tháng này',
        expenseThisMonth: 'Chi tiêu tháng này',
        savingsThisMonth: 'Tiết kiệm tháng này',
        totalTransactions: 'Số giao dịch',
        
        // Categories Page
        categoriesTitle: 'Quản Lý Danh Mục',
        categoriesSubtitle: 'Tạo và quản lý danh mục thu chi của bạn',
        addCategory: 'Thêm Danh Mục',
        incomeCategories: 'Thu Nhập',
        expenseCategories: 'Chi Tiêu',
        categoryName: 'Tên danh mục',
        categoryType: 'Loại danh mục',
        categoryIcon: 'Biểu tượng',
        categoryColor: 'Màu sắc',
        incomeType: 'Thu nhập',
        expenseType: 'Chi tiêu',
        editCategory: 'Chỉnh Sửa Danh Mục',
        addNewCategory: 'Thêm Danh Mục Mới',
        categoryTypeLabel: 'Loại',
        noIncomeCategories: 'Chưa có danh mục thu nhập nào. Hãy thêm danh mục đầu tiên!',
        noExpenseCategories: 'Chưa có danh mục chi tiêu nào. Hãy thêm danh mục đầu tiên!',

        // Settings
        settings: 'Cài đặt',
        appearance: 'Giao diện',
        theme: 'Chủ đề',
        language: 'Ngôn ngữ',
        currency: 'Tiền tệ',
        
        // Theme options
        light: 'Sáng',
        dark: 'Tối',
        auto: 'Tự động',
        
        // Language options
        vietnamese: 'Tiếng Việt',
        english: 'English',

        // Chart types
        pieChart: 'Tròn',
        barChart: 'Cột',
        lineChart: 'Đường',

        // Additional Statistics texts
        totalExpensesText: 'Tổng chi tiêu',
        recentActivity: 'Hoạt động gần đây',
        recentActivityDesc: 'Hoạt động gần đây sẽ hiển thị ở đây',
        viewAllTransactions: 'Xem tất cả giao dịch',

        // Settings Page
        settingsTitle: 'Cài Đặt',
        settingsSubtitle: 'Quản lý tài khoản và tùy chỉnh ứng dụng',
        editProfile: 'Chỉnh Sửa Hồ Sơ',
        accountInfo: 'Thông Tin Tài Khoản',
        notificationSettings: 'Cài Đặt Thông Báo',
        backupDescription: 'Bản sao lưu sẽ bao gồm tất cả giao dịch, danh mục và cài đặt của bạn.',
        personalSettings: 'Cài đặt cá nhân',

        // Notifications Page
        notificationsTitle: 'Thông Báo & Gợi Ý',
        notificationsSubtitle: 'Theo dõi cảnh báo và nhận gợi ý tài chính thông minh',
        markAllAsRead: 'Đánh dấu tất cả đã đọc',
        allTab: 'Tất cả',
        unreadTab: 'Chưa đọc',
        warningTab: 'Cảnh báo',
        suggestionTab: 'Gợi ý',
        achievementTab: 'Thành tựu',
        allNotificationsRead: 'Tất cả thông báo đã được đọc!',
        noWarnings: 'Không có cảnh báo nào!',
        spendingUnderControl: 'Chi tiêu của bạn đang trong tầm kiểm soát',
        noNewSuggestions: 'Chưa có gợi ý mới',
        noNewAchievements: 'Chưa có thành tựu mới',
        keepManagingFinances: 'Hãy tiếp tục quản lý tài chính tốt để đạt được thành tựu!',
        budgetAlerts: 'Cảnh báo ngân sách',
        savingTips: 'Gợi ý tiết kiệm',
        achievementNotifications: 'Thông báo thành tựu',
        unreadLabel: 'Chưa đọc:',
        warningLabel: 'Cảnh báo:',
        suggestionLabel: 'Gợi ý:',

        // Budget Page
        budgetManagement: 'Quản Lý Ngân Sách',
        budgetSubtitle: 'Theo dõi và kiểm soát chi tiêu của bạn',
        createBudget: 'Tạo Ngân Sách',
        monthlyBudgetOverview: 'Tổng Quan Ngân Sách Tháng Này',
        budgetExceededWarning: 'Cảnh báo: Có ngân sách đã vượt mức!',
        budgetExceededDesc: 'Một hoặc nhiều ngân sách của bạn đã vượt quá giới hạn đề ra.',
        noBudgetsYet: 'Chưa có ngân sách nào được tạo',
        createFirstBudget: 'Hãy tạo ngân sách đầu tiên để bắt đầu quản lý chi tiêu',
        createFirstBudgetBtn: 'Tạo Ngân Sách Đầu Tiên',
        editBudget: 'Chỉnh Sửa Ngân Sách',
        createNewBudget: 'Tạo Ngân Sách Mới',
        processing: 'Đang xử lý...',
        update: 'Cập Nhật'
      },
      en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        
        // Dashboard
        dashboard: 'Dashboard',
        totalIncome: 'Total Income',
        totalExpense: 'Total Expense',
        balance: 'Balance',
        welcome: 'Welcome',
        warningTitle: 'Warning: Expenses exceed income!',
        warningMessage: 'You are spending more than you earn. Deficit amount:',
        suggestions: 'Improvement suggestions:',
        reduceExpenses: 'Reduce unnecessary expenses',
        increaseIncome: 'Find additional income sources',
        reviewBudget: 'Review budget',
        totalExpensesLabel: 'Total Expenses:',
        viewDetailedStats: 'View Detailed Statistics',

        // Transactions
        transactions: 'Transactions',
        income: 'Income',
        expense: 'Expense',
        category: 'Category',
        amount: 'Amount',
        date: 'Date',
        description: 'Description',

        // Navigation
        statistics: 'Statistics',
        budget: 'Budget',
        notifications: 'Notifications',

        // Transaction List Page
        transactionListTitle: 'Transaction List',
        transactionListSubtitle: 'Manage all your income and expenses',
        addIncome: 'Add Income',
        addExpense: 'Add Expense',
        searchTransactions: 'Search transactions...',
        type: 'Type',
        filterButton: 'FILTER',
        actions: 'Actions',

        // Add Transaction Page
        addTransactionTitle: 'Add Transaction',
        addTransactionSubtitle: 'Record your income or expenses',
        saveTransaction: 'Save Transaction',
        saving: 'Saving...',

        // Statistics Page
        statisticsTitle: 'Statistics & Reports',
        statisticsSubtitle: 'Detailed analysis of your financial situation',
        exportReport: 'Export Report',
        expensesByCategory: 'Expenses by Category',
        loadingStats: 'Loading statistics data...',
        noStatsData: 'No statistics data',
        noStatsMessage: 'Create some transactions to view expense statistics by category',
        analyzeExpensesByCategory: 'Analyze expenses by category',
        thisMonth: 'This month',
        thisWeek: 'This week',
        thisYear: 'This year',

        // Dashboard sections
        incomeThisMonth: 'Income this month',
        expenseThisMonth: 'Expenses this month',
        savingsThisMonth: 'Savings this month',
        totalTransactions: 'Total transactions',
        
        // Categories Page
        categoriesTitle: 'Category Management',
        categoriesSubtitle: 'Create and manage your income and expense categories',
        addCategory: 'Add Category',
        incomeCategories: 'Income',
        expenseCategories: 'Expenses',
        categoryName: 'Category name',
        categoryType: 'Category type',
        categoryIcon: 'Icon',
        categoryColor: 'Color',
        incomeType: 'Income',
        expenseType: 'Expense',
        editCategory: 'Edit Category',
        addNewCategory: 'Add New Category',
        categoryTypeLabel: 'Type',
        noIncomeCategories: 'No income categories yet. Add your first category!',
        noExpenseCategories: 'No expense categories yet. Add your first category!',

        // Settings
        settings: 'Settings',
        appearance: 'Appearance',
        theme: 'Theme',
        language: 'Language',
        currency: 'Currency',
        
        // Theme options
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
        
        // Language options
        vietnamese: 'Tiếng Việt',
        english: 'English',

        // Chart types
        pieChart: 'Pie',
        barChart: 'Bar',
        lineChart: 'Line',

        // Additional Statistics texts
        totalExpensesText: 'Total Expenses',
        recentActivity: 'Recent Activity',
        recentActivityDesc: 'Recent activity will be displayed here',
        viewAllTransactions: 'View All Transactions',

        // Settings Page
        settingsTitle: 'Settings',
        settingsSubtitle: 'Manage account and customize application',
        editProfile: 'Edit Profile',
        accountInfo: 'Account Information',
        notificationSettings: 'Notification Settings',
        backupDescription: 'Backup will include all your transactions, categories and settings.',
        personalSettings: 'Personal settings',

        // Notifications Page
        notificationsTitle: 'Notifications & Suggestions',
        notificationsSubtitle: 'Track alerts and receive smart financial suggestions',
        markAllAsRead: 'Mark all as read',
        allTab: 'All',
        unreadTab: 'Unread',
        warningTab: 'Warnings',
        suggestionTab: 'Suggestions',
        achievementTab: 'Achievements',
        allNotificationsRead: 'All notifications have been read!',
        noWarnings: 'No warnings!',
        spendingUnderControl: 'Your spending is under control',
        noNewSuggestions: 'No new suggestions',
        noNewAchievements: 'No new achievements',
        keepManagingFinances: 'Keep managing your finances well to achieve more!',
        budgetAlerts: 'Budget alerts',
        savingTips: 'Saving tips',
        achievementNotifications: 'Achievement notifications',
        unreadLabel: 'Unread:',
        warningLabel: 'Warnings:',
        suggestionLabel: 'Suggestions:',

        // Budget Page
        budgetManagement: 'Budget Management',
        budgetSubtitle: 'Track and control your spending',
        createBudget: 'Create Budget',
        monthlyBudgetOverview: 'Monthly Budget Overview',
        budgetExceededWarning: 'Warning: Budget exceeded!',
        budgetExceededDesc: 'One or more of your budgets have exceeded the set limit.',
        noBudgetsYet: 'No budgets created yet',
        createFirstBudget: 'Create your first budget to start managing expenses',
        createFirstBudgetBtn: 'Create First Budget',
        editBudget: 'Edit Budget',
        createNewBudget: 'Create New Budget',
        processing: 'Processing...',
        update: 'Update'
      }
    };

    return texts[language as keyof typeof texts]?.[key as keyof typeof texts.vi] || key;
  };

  return {
    // Settings values
    theme,
    language,
    currency,
    
    // Utility functions
    formatCompact,
    formatFull,
    getText,
    
    // Computed values
    isDark: theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isVietnamese: language === 'vi',
    isEnglish: language === 'en'
  };
};
