// This formatting is from Classic
export const formatCPU = (n: number) => {
  const numDigits = n >= 1 || n <= 0.01 ? 0 : 2;
  return n.toFixed(numDigits) + '%';
};
