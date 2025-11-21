/**
 * Format utilities for the Advayacare website
 */

/**
 * Format number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "₹ 12,500")
 */
export function formatINR(amount) {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
