// import * as React from 'react';

import { getSSHKeyString, MAX_SSH_KEYS_DISPLAY } from './UserSSHKeyPanel';

const manyKeys: string[] = [];
for (let i = 0; i < MAX_SSH_KEYS_DISPLAY + 20; i++) {
  manyKeys.push(`key-${i}`);
}

describe('UserSSHKeyPanel', () => {
  describe('getSSHKeyString helper function', () => {
    it('should truncate a long list of keys', () => {
      expect(getSSHKeyString(manyKeys)).toMatch(/...and 20 more/);
    });

    it('should comma-separate a short list of keys', () => {
      expect(getSSHKeyString(['key-1', 'key-2', 'key-3'])).toEqual(
        'key-1, key-2, key-3'
      );
    });
  });
});
