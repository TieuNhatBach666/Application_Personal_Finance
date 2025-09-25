// Cấu hình tiền tệ
const CURRENCY_CONFIG = {
  VND: {
    symbol: '₫',
    locale: 'vi-VN',
    position: 'after',
    compactUnits: {
      thousand: 'k',
      million: 'tr',
      billion: 'tỷ',
      trillion: 'N tỷ'
    }
  },
  USD: {
    symbol: '$',
    locale: 'en-US',
    position: 'before',
    compactUnits: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
      trillion: 'T'
    }
  },
  EUR: {
    symbol: '€',
    locale: 'de-DE',
    position: 'after',
    compactUnits: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
      trillion: 'T'
    }
  }
};

// Hàm tiện ích để format số tiền ngắn gọn với cài đặt tiền tệ
export const formatCurrencyCompact = (amount: number, currency: string = 'VND'): string => {
  if (amount === 0) return `0 ${CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG]?.symbol || '₫'}`;

  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.VND;
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000000000) { // Nghìn tỷ
    return `${(amount / 1000000000000).toFixed(1)}${config.compactUnits.trillion}`;
  } else if (absAmount >= 1000000000) { // Tỷ
    return `${(amount / 1000000000).toFixed(1)} ${config.compactUnits.billion}`;
  } else if (absAmount >= 1000000) { // Triệu
    return `${(amount / 1000000).toFixed(1)} ${config.compactUnits.million}`;
  } else if (absAmount >= 1000) { // Nghìn
    return `${(amount / 1000).toFixed(0)}${config.compactUnits.thousand}`;
  } else {
    const formatted = amount.toLocaleString(config.locale);
    return config.position === 'before'
      ? `${config.symbol}${formatted}`
      : `${formatted} ${config.symbol}`;
  }
};

// Format đầy đủ cho tooltip với cài đặt tiền tệ
export const formatCurrencyFull = (amount: number, currency: string = 'VND'): string => {
  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.VND;
  const formatted = amount.toLocaleString(config.locale);
  return config.position === 'before'
    ? `${config.symbol}${formatted}`
    : `${formatted} ${config.symbol}`;
};

// Format phần trăm
export const formatPercentage = (percentage: number): string => {
  if (isNaN(percentage) || !isFinite(percentage)) return '0%';
  return `${Math.round(percentage)}%`;
};
