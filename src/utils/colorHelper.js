/**
 * Color Helper Functions
 * Utility functions for color manipulation
 */

/**
 * Convert hex color to rgba with opacity
 * @param {string} hex - Hex color (e.g., '#00711e' or '#3B82F6')
 * @param {number} opacity - Opacity value between 0 and 1 (e.g., 0.2 for 20%)
 * @returns {string} rgba color string
 */
export const hexToRgba = (hex, opacity = 1) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Add opacity to a color (works with hex, rgb, hsl)
 * For hex colors, converts to rgba
 * @param {string} color - Color string
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {string} Color with opacity
 */
export const withOpacity = (color, opacity = 0.2) => {
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity);
  }
  // For hsl or rgb, try to convert
  if (color.startsWith('hsl')) {
    // Extract hsl values and convert to rgba
    const match = color.match(/hsl\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => v.trim());
      return `hsla(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }
  // Fallback: return original color
  return color;
};

