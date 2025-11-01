// Application constants
export const APP_CONSTANTS = {
  CART_STORAGE_KEY: 'cart-storage',
  USER_STORAGE_KEY: 'wp_user',
  JWT_TOKEN_STORAGE_KEY: 'wp_jwt_token',
  AUTH_TOKEN_STORAGE_KEY: 'wp_auth_token',
  DEFAULT_CURRENCY: 'BDT',
  DEFAULT_CURRENCY_SYMBOL: '৳',
  MAX_CART_ITEMS_DISPLAY: 99,
  DEFAULT_PRODUCT_IMAGE: '/placeholder.webp',
  DEFAULT_API_TIMEOUT: 10000,
} as const;

// Collection constants
export const COLLECTIONS = {
  BESTSELLERS: 'bestsellers',
  SUN_CARE: 'sun-care',
  LIP_BALM: 'lip-balm',
  HAIRFALL: 'hairfall',
  ACNE: 'acne',
  PIGMENTATION: 'pigmentation',
  DULL_SKIN: 'dull-skin',
  DETAN: 'detan',
  DAMAGED_HAIR: 'damaged-hair',
  ALL_PRODUCTS: 'all-products',
} as const;