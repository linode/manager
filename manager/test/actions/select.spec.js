import { expectObjectDeepEquals } from '@/common';

import { TOGGLE_SELECTED } from '~/actions/select';
import toggleSelected from '~/actions/select';

describe('actions/select', () => {
  describe('toggleSelected', () => {
    it('should return a TOGGLE_SELECTED action', () => {
      const state = toggleSelected('example', '1234');
      expectObjectDeepEquals(state, {
        type: TOGGLE_SELECTED,
        objectType: 'example',
        selectedIds: ['1234'],
      });
    });
  });
});
