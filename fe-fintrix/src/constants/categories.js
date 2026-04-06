// ============================================================
// FILE INI ADALAH SINGLE SOURCE OF TRUTH untuk semua kategori
// Digunakan oleh TransactionsPage, BudgetPage, AnalyticsPage, ReportsPage
// ============================================================

export const CATEGORIES_INCOME = [
  "Salary",
  "Freelance",
  "Investment",
  "Side Hustle",
  "Others",
];

export const CATEGORIES_EXPENSE = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Bills & Utilities",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Education",
  "Miscellaneous",
  "Others",
];

// Untuk Budget — pakai kategori expense yang sama persis
export const BUDGET_CATEGORIES = CATEGORIES_EXPENSE;

// Semua kategori gabungan (untuk filter)
export const ALL_CATEGORIES = [
  "All Categories",
  ...CATEGORIES_INCOME,
  ...CATEGORIES_EXPENSE,
];
