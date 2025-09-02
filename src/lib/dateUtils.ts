// Utility functions for handling date ranges in finance tracking

/**
 * Get proper date range for a given month (YYYY-MM format)
 * Returns start date and end date for querying expenses within that month
 */
export const getMonthDateRange = (monthStr: string) => {
  const startDate = `${monthStr}-01`;
  const nextMonth = new Date(monthStr + '-01');
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const endDate = nextMonth.toISOString().slice(0, 10);
  return { startDate, endDate };
};

/**
 * Get current month in YYYY-MM format
 */
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * Format date for display
 */
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};