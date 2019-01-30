export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default capitalize;

export const capitalizeAllWords = (s: string) => {
  return s
    .split(' ')
    .map(capitalize)
    .join(' ');
};
