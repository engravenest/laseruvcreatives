/**
 * Utility functions for LaserUVCreatives.
 */

/**
 * Format a number into Pakistani Rupee currency format (e.g. 2500 -> "Rs. 2,500").
 */
export function formatPKR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
}

/**
 * Validates a Pakistani mobile number (e.g., 03001234567 or +923001234567).
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^((\+92)|(0092)|(0))?3[0-9]{9}$/.test(cleaned);
}
