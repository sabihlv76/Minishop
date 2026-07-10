export const CART_KEY = 'cmm_cart';
export const WISHLIST_KEY = 'cmm_wishlist';
export const USER_KEY = 'cmm_user';
export const ADMIN_SETTINGS_KEY = 'cmm_admin_settings';
export const ADMIN_AUTH_KEY = 'cmm_admin_authenticated';

export const defaultAdminSettings = {
  ownerName: 'Beathe',
  storeName: 'Chez Mama munyana',
  phone: '0788745874',
  location: 'Muhanga',
  pin: '0788',
};

export function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage`, error);
  }
}
