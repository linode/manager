import type {
  RecursiveTokenObject,
  TokenObject,
} from 'src/dev-tools/DesignTokensTool';

export const filterTokenObject = (
  obj: RecursiveTokenObject | TokenObject | string,
  searchTerm: string,
  path: string[] = []
): RecursiveTokenObject | string => {
  if (typeof obj === 'string') {
    // If it's a color value, check if it matches
    return obj.toLowerCase().includes(searchTerm) ? obj : {};
  }

  const filtered: Record<string, RecursiveTokenObject | string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = [...path, key];

    // Check if the key or path matches
    const keyMatches = key.toLowerCase().includes(searchTerm);
    const pathMatches = currentPath
      .join('.')
      .toLowerCase()
      .includes(searchTerm);

    if (keyMatches || pathMatches) {
      // If key matches, include the whole subtree
      filtered[key] = value;
    } else if (typeof value === 'object') {
      // Recursively filter nested objects
      const filteredValue = filterTokenObject(value, searchTerm, currentPath);
      if (filteredValue && Object.keys(filteredValue).length > 0) {
        filtered[key] = filteredValue;
      }
    } else if (
      typeof value === 'string' &&
      value.toLowerCase().includes(searchTerm)
    ) {
      // If value matches (e.g., color code)
      filtered[key] = value;
    }
  });

  return Object.keys(filtered).length > 0 ? filtered : {};
};

export const formatValue = (value: any) =>
  isNaN(Number(value)) ? `${value}` : `[${value}]`;

export const camelToKebabCase = (str: string) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};
