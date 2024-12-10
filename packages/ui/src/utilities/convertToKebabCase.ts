export const convertToKebabCase = (string: string) => {
  return string.replace(/\s+/g, '-').toLowerCase();
};
