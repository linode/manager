import { describe, expect, it } from 'vitest';

import { initWindows } from './initWindows';

const timezone1 = 'America/New_York';
const timezone2 = 'Europe/London';

describe('initWindows', () => {
  it('should have "Choose a Time" as the first option if the "unshift" argument is true', () => {
    expect(initWindows(timezone1, true)[0][0]).toEqual('Choose a time');
    expect(initWindows(timezone1, true)).toHaveLength(13); // Twelve 2-hour windows, plus the 'Choose a time' element
  });

  it('should not have "Choose a Time" as the first option if the "unshift" argument is not true', () => {
    expect(initWindows(timezone2)[0][0]).not.toEqual('Choose a time');
    expect(initWindows(timezone2)).toHaveLength(12);
  });
});
