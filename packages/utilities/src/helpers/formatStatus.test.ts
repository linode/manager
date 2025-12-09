import { describe, expect, it } from 'vitest';

import { getFormattedStatus } from './formatStatus';

describe('getFormattedStatus', () => {
  it('should capitalize a single lowercase word', () => {
    expect(getFormattedStatus('active')).toBe('Active');
  });

  it('should replace underscore with space and capitalize each word', () => {
    expect(getFormattedStatus('in_progress')).toBe('In Progress');
  });

  it('should handle multiple underscores correctly', () => {
    expect(getFormattedStatus('waiting_for_user_action')).toBe(
      'Waiting For User Action',
    );
  });

  it('should handle mixed case inputs', () => {
    expect(getFormattedStatus('In_Progress')).toBe('In Progress');
  });

  it('should handle empty string', () => {
    expect(getFormattedStatus('')).toBe('');
  });
});
