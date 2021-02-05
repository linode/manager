import { formatTimeRemaining } from './RenderProgressEvent';

describe('Pending Actions', () => {
  describe('formatTimeRemaining helper', () => {
    it('should return null for invalid input', () => {
      expect(formatTimeRemaining(4959348 as any)).toBe(null);
      expect(formatTimeRemaining('')).toBe(null);
      expect(formatTimeRemaining('1 hour')).toBe(null);
      expect(formatTimeRemaining('08:34')).toBe(null);
    });

    it('should return a short duration as minutes remaining', () => {
      expect(formatTimeRemaining('00:15:00')).toMatch('15 minutes remaining');
    });

    it('should round to the nearest minute', () => {
      expect(formatTimeRemaining('00:08:28')).toMatch('8 minutes remaining');
      expect(formatTimeRemaining('00:08:31')).toMatch('9 minutes remaining');
    });

    it('should return a long duration as hours remaining', () => {
      expect(formatTimeRemaining('2:15:00')).toMatch('2 hours remaining');
    });

    it('should round to the nearest hour', () => {
      expect(formatTimeRemaining('7:40:28')).toMatch('8 hours remaining');
      expect(formatTimeRemaining('7:19:28')).toMatch('7 hours remaining');
    });
  });
});
