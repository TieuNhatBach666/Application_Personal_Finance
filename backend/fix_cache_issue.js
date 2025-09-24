// Script để sửa vấn đề cache 304 Not Modified
// Thêm headers để force refresh budget data

const express = require('express');

// Middleware để disable cache cho budget APIs
const noCacheMiddleware = (req, res, next) => {
  // Disable caching for budget-related endpoints
  if (req.path.includes('/budgets')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': false
    });
  }
  next();
};

module.exports = noCacheMiddleware;
