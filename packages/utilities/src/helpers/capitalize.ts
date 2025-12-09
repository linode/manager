export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const capitalizeAllWords = (s: string, delimiter = ' ') => {
  return s.split(delimiter).map(capitalize).join(' ');
};
