import { formatCPU } from './formatters';
describe('formatCPU', () => {
  it('should round values >= 1 to the nearest whole number', () => {
    expect(formatCPU(8.3)).toBe('8%');
    expect(formatCPU(8.5)).toBe('9%');
  });
  it('should display two digits for 0.01 > n < 1', () => {
    expect(formatCPU(0.3)).toBe('0.30%');
    expect(formatCPU(0.03)).toBe('0.03%');
    expect(formatCPU(0.09)).toBe('0.09%');
  });
  it('should display "0%" for 0 > n <= 0.01', () => {
    expect(formatCPU(0.009)).toBe('0%');
    expect(formatCPU(0)).toBe('0%');
    expect(formatCPU(0.01)).toBe('0%');
  });
});
