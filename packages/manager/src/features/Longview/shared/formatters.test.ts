import { LongviewCPU } from '../request.types';
import { formatCPU, pathMaybeAddDataInThePast } from './formatters';

describe('formatCPU', () => {
  it('should round values >= 1 to the nearest whole number', () => {
    expect(formatCPU(8.3)).toBe('8%');
    expect(formatCPU(8.5)).toBe('9%');
    expect(formatCPU(1.1)).toBe('1%');
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

describe('pathMaybeAddDataInThePast', () => {
  it('should add a datapoint in the past correctly', () => {
    const oct18GMTInSeconds = 1571356800;
    const oct29GMTInSeconds = 1572357800;
    const oct29GMTInSecondsMinus2Mins = oct29GMTInSeconds - 100;

    const dummyCPU: LongviewCPU = {
      CPU: {
        cpu1: {
          user: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          wait: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          system: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ]
        }
      }
    };

    const result = pathMaybeAddDataInThePast<LongviewCPU>(
      dummyCPU,
      oct18GMTInSeconds,
      [
        ['CPU', 'cpu1', 'user'],
        ['CPU', 'cpu1', 'wait'],
        ['CPU', 'cpu1', 'system']
      ]
    );

    expect(result).toEqual({
      CPU: {
        cpu1: {
          user: [
            {
              x: oct18GMTInSeconds,
              y: null
            },
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          wait: [
            {
              x: oct18GMTInSeconds,
              y: null
            },
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          system: [
            {
              x: oct18GMTInSeconds,
              y: null
            },
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ]
        }
      }
    });

    const result2 = pathMaybeAddDataInThePast<LongviewCPU>(
      dummyCPU,
      oct29GMTInSecondsMinus2Mins,
      [
        ['CPU', 'cpu1', 'user'],
        ['CPU', 'cpu1', 'wait'],
        ['CPU', 'cpu1', 'system']
      ]
    );

    expect(result2).toEqual({
      CPU: {
        cpu1: {
          user: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          wait: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ],
          system: [
            {
              x: oct29GMTInSeconds,
              y: 123
            }
          ]
        }
      }
    });

    const result3 = pathMaybeAddDataInThePast<LongviewCPU>(
      {
        CPU: {
          cpu1: {
            wait: [],
            user: [],
            system: []
          }
        }
      },
      oct18GMTInSeconds,
      [
        ['CPU', 'cpu1', 'user'],
        ['CPU', 'cpu1', 'wait'],
        ['CPU', 'cpu1', 'system']
      ]
    );

    expect(result3).toEqual({
      CPU: {
        cpu1: {
          wait: [],
          user: [],
          system: []
        }
      }
    });
  });
});
