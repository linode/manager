import type {
  RecursiveTokenObject,
  TokenObject,
} from 'src/dev-tools/DesignTokensTool';

export const filterTokenObject = (
  obj: RecursiveTokenObject | TokenObject | string,
  searchTerm: string,
  path: string[] = []
): RecursiveTokenObject | string => {
  if (searchTerm.length < 3) {
    return {};
  }

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

export const countTokens = (
  obj: RecursiveTokenObject | TokenObject | string
): number => {
  if (typeof obj === 'string') {
    return 1;
  }

  return Object.values(obj).reduce((count, value) => {
    if (typeof value === 'object') {
      return count + countTokens(value);
    }
    return count + 1;
  }, 0);
};

export const formatValue = (value: string) => {
  // If it's a pure number, wrap in brackets
  if (!isNaN(Number(value))) {
    return `[${value}]`;
  }

  // For any string containing a number
  const match = value.match(/(\d+)/);
  if (match) {
    const parts = value.split(match[0]);
    return `${parts[0]}[${match[0]}]${parts[1]}`;
  }

  return value;
};

export const camelToKebabCase = (str: string) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};
