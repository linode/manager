/**
 * Converts a hexadecimal color string to RGB values
 *
 * @param hex - Hexadecimal color string (e.g., "#FF5733" or "FF5733")
 * @returns Array of three numbers representing RGB values [r, g, b] (0-255)
 */
export const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
};
