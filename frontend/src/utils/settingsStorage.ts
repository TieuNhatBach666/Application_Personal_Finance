/**
 * Settings Storage Utility
 * Quản lý việc lưu trữ settings trong localStorage
 * Tác giả: Tiểu Nhất Bạch
 */

export interface UserSettings {
  appearance: {
    theme: string;
    language: string;
    currency: string;
  };
  notifications: {
    push: boolean;
    email: boolean;
    budget: boolean;
    achievements: boolean;
    reports: boolean;
  };
  privacy: {
    show_profile: boolean;
    share_data: boolean;
    analytics: boolean;
  };
  backup: {
    auto_backup: boolean;
    backup_frequency: string;
  };
}

const SETTINGS_KEY = 'userSettings';

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  appearance: {
    theme: 'light',
    language: 'vi',
    currency: 'VND',
  },
  notifications: {
    push: true,
    email: true,
    budget: true,
    achievements: true,
    reports: true,
  },
  privacy: {
    show_profile: true,
    share_data: false,
    analytics: true,
  },
  backup: {
    auto_backup: true,
    backup_frequency: 'weekly',
  },
};

/**
 * Load settings from localStorage
 */
export const loadSettingsFromStorage = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = {
        appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
        backup: { ...DEFAULT_SETTINGS.backup, ...parsed.backup },
      };
      return merged;
    }
  } catch (error) {
    console.error('❌ Error loading settings from localStorage:', error);
  }

  return DEFAULT_SETTINGS;
};

/**
 * Save settings to localStorage
 */
export const saveSettingsToStorage = (settings: Partial<UserSettings>): void => {
  try {
    const current = loadSettingsFromStorage();
    const updated = {
      appearance: { ...current.appearance, ...settings.appearance },
      notifications: { ...current.notifications, ...settings.notifications },
      privacy: { ...current.privacy, ...settings.privacy },
      backup: { ...current.backup, ...settings.backup },
    };
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    console.log('💾 Settings saved to localStorage:', updated);
  } catch (error) {
    console.error('❌ Error saving settings to localStorage:', error);
  }
};

/**
 * Save specific setting to localStorage
 */
export const saveSetting = (category: keyof UserSettings, key: string, value: any): void => {
  try {
    const current = loadSettingsFromStorage();
    (current[category] as any)[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
    console.log(`💾 Setting saved: ${category}.${key} = ${value}`);
  } catch (error) {
    console.error('❌ Error saving setting to localStorage:', error);
  }
};

/**
 * Clear all settings from localStorage
 */
export const clearSettingsFromStorage = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    console.log('🗑️ Settings cleared from localStorage');
  } catch (error) {
    console.error('❌ Error clearing settings from localStorage:', error);
  }
};

/**
 * Get specific setting value
 */
export const getSetting = (category: keyof UserSettings, key: string): any => {
  const settings = loadSettingsFromStorage();
  return (settings[category] as any)[key];
};
