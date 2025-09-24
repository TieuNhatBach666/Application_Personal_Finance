// Utility để format số tiền ngắn gọn
export const formatCurrencyCompact = (amount: number): string => {
  if (amount === 0) return '0 ₫';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000000) { // Nghìn tỷ
    return `${(amount / 1000000000000).toFixed(1)}N tỷ`;
  } else if (absAmount >= 1000000000) { // Tỷ
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  } else if (absAmount >= 1000000) { // Triệu
    return `${(amount / 1000000).toFixed(1)} tr`;
  } else if (absAmount >= 1000) { // Nghìn
    return `${(amount / 1000).toFixed(0)}k`;
  } else {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
};

// Format đầy đủ cho tooltip
export const formatCurrencyFull = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

// Format phần trăm
export const formatPercentage = (percentage: number): string => {
  if (isNaN(percentage) || !isFinite(percentage)) return '0%';
  return `${Math.round(percentage)}%`;
};
