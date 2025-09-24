const Joi = require('joi');

// Validation schemas
const schemas = {
    // User registration
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu là bắt buộc'
        }),
        firstName: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Tên không được để trống',
            'string.max': 'Tên không được quá 100 ký tự',
            'any.required': 'Tên là bắt buộc'
        }),
        lastName: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Họ không được để trống',
            'string.max': 'Họ không được quá 100 ký tự',
            'any.required': 'Họ là bắt buộc'
        }),
        phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().messages({
            'string.pattern.base': 'Số điện thoại không hợp lệ'
        })
    }),

    // User login
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Mật khẩu là bắt buộc'
        })
    }),

    // Transaction creation
    createTransaction: Joi.object({
        categoryId: Joi.string().guid().required().messages({
            'string.guid': 'ID danh mục không hợp lệ',
            'any.required': 'Danh mục là bắt buộc'
        }),
        amount: Joi.number().positive().required().messages({
            'number.positive': 'Số tiền phải lớn hơn 0',
            'any.required': 'Số tiền là bắt buộc'
        }),
        type: Joi.string().valid('Income', 'Expense').required().messages({
            'any.only': 'Loại giao dịch phải là Income hoặc Expense',
            'any.required': 'Loại giao dịch là bắt buộc'
        }),
        description: Joi.string().max(500).optional().messages({
            'string.max': 'Mô tả không được quá 500 ký tự'
        }),
        transactionDate: Joi.date().required().messages({
            'date.base': 'Ngày giao dịch không hợp lệ',
            'any.required': 'Ngày giao dịch là bắt buộc'
        }),
        tags: Joi.string().max(200).optional().messages({
            'string.max': 'Tags không được quá 200 ký tự'
        })
    }),

    // Category creation
    createCategory: Joi.object({
        name: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Tên danh mục không được để trống',
            'string.max': 'Tên danh mục không được quá 100 ký tự',
            'any.required': 'Tên danh mục là bắt buộc'
        }),
        type: Joi.string().valid('Income', 'Expense').required().messages({
            'any.only': 'Loại danh mục phải là Income hoặc Expense',
            'any.required': 'Loại danh mục là bắt buộc'
        }),
        icon: Joi.string().max(50).optional().messages({
            'string.max': 'Icon không được quá 50 ký tự'
        }),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
            'string.pattern.base': 'Màu sắc phải có định dạng hex (#RRGGBB)'
        })
    }),

    // Budget creation
    createBudget: Joi.object({
        name: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Tên ngân sách không được để trống',
            'string.max': 'Tên ngân sách không được quá 100 ký tự',
            'any.required': 'Tên ngân sách là bắt buộc'
        }),
        totalAmount: Joi.number().positive().required().messages({
            'number.positive': 'Tổng ngân sách phải lớn hơn 0',
            'any.required': 'Tổng ngân sách là bắt buộc'
        }),
        period: Joi.string().valid('monthly', 'quarterly', 'yearly').required().messages({
            'any.only': 'Kỳ ngân sách phải là monthly, quarterly hoặc yearly',
            'any.required': 'Kỳ ngân sách là bắt buộc'
        }),
        startDate: Joi.date().required().messages({
            'date.base': 'Ngày bắt đầu không hợp lệ',
            'any.required': 'Ngày bắt đầu là bắt buộc'
        }),
        endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
            'date.base': 'Ngày kết thúc không hợp lệ',
            'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
            'any.required': 'Ngày kết thúc là bắt buộc'
        }),
        alertThreshold: Joi.number().min(0).max(100).optional().messages({
            'number.min': 'Ngưỡng cảnh báo phải từ 0%',
            'number.max': 'Ngưỡng cảnh báo không được quá 100%'
        })
    })
};

// Validation middleware factory
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                success: false,
                message: 'Validation schema not found'
            });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors
            });
        }

        req.validatedData = value;
        next();
    };
};

// Query parameter validation
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Query parameters không hợp lệ',
                errors
            });
        }

        req.validatedQuery = value;
        next();
    };
};

// Common query schemas
const querySchemas = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    }),

    dateRange: Joi.object({
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        month: Joi.number().integer().min(1).max(12).optional(),
        year: Joi.number().integer().min(2020).optional()
    }),

    transactionFilters: Joi.object({
        categoryId: Joi.string().guid().optional(),
        type: Joi.string().valid('Income', 'Expense').optional(),
        minAmount: Joi.number().min(0).optional(),
        maxAmount: Joi.number().min(0).optional(),
        search: Joi.string().max(100).optional()
    })
};

module.exports = {
    validate,
    validateQuery,
    schemas,
    querySchemas
};