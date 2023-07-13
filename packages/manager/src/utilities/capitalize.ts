export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const capitalizeAllWords = (s: string) => {
  return s.split(' ').map(capitalize).join(' ');
};

type Delimiter = '_' | '-';

export const capitalizeAllDelimitedWords = (
  s: string,
  delimiter: Delimiter
) => {
  return s.split(delimiter).map(capitalize).join(' ');
};
