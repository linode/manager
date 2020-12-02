export const evenizeNumber = (n: number): number => {
  if (n === 0) {
    return n;
  }
  return n % 2 === 0 ? n : n - 1;
};
