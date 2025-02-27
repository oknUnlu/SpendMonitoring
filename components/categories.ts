// Category color definitions with a more diverse palette
export const categoryColors = {
  Restaurants: '#FF6B6B',
  Entertainment: '#4ECDC4',
  Salary: '#45B7D1',
  Shopping: '#96CEB4',
  Transport: '#845EC2',
  Healthcare: '#FF9671',
  Education: '#FFC75F',
  Housing: '#F9F871',
  Utilities: '#00C9A7',
  Insurance: '#B39CD0',
  Savings: '#4D8076',
  Investment: '#00B4D8',
  Travel: '#C490D1',
  Groceries: '#FFDDA1',
  Other: '#FFEEAD'
} as const;

// Category icons using Material Icons
export const addCategoryIcons = {
  Restaurants: 'restaurant',
  Entertainment: 'tv',
  Salary: 'payments',
  Shopping: 'shopping-bag',
  Transport: 'directions-car',
  Healthcare: 'medical-services',
  Education: 'school',
  Housing: 'home',
  Utilities: 'power',
  Insurance: 'security',
  Savings: 'savings',
  Investment: 'trending-up',
  Travel: 'flight',
  Groceries: 'local-grocery-store',
  Dining: 'restaurant-menu',
  Other: 'more-horiz',
} as const;

export const categoryIcons = {
  Restaurants: 'utensils',
  Entertainment: 'film',
  Salary: 'money-bill-wave',
  Shopping: 'shopping-bag',
  Transport: 'car',
  Healthcare: 'hospital',
  Education: 'graduation-cap',
  Housing: 'home',
  Utilities: 'plug',
  Insurance: 'shield-alt',
  Savings: 'piggy-bank',
  Investment: 'chart-line',
  Travel: 'plane',
  Groceries: 'shopping-basket',
  Other: 'dollar-sign'  // "ellipsis-h" yerine "dollar-sign" kullanıyoruz
} as const;

// Monthly budget limits for categories
export const categoryLimits = {
  Restaurants: 300,
  Entertainment: 150,
  Salary: 5000,
  Shopping: 200,
  Transport: 100,
  Healthcare: 200,
  Education: 300,
  Housing: 1000,
  Utilities: 200,
  Insurance: 150,
  Savings: 500,
  Investment: 300,
  Travel: 400,
  Groceries: 400,
  Dining: 300,
  Other: 100,
} as const;

export type Category = keyof typeof categoryColors;
export type CategoryIcon = typeof categoryIcons[Category];

export interface CategoryPillProps {
  category: Category;
  amount: number;
  icon?: CategoryIcon;  // icon'u opsiyonel yap
}
