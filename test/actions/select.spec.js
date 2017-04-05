import { expect } from 'chai';
import { TOGGLE_SELECTED } from '~/actions/select';
import toggleSelected from '~/actions/select';

describe('actions/select', () => {
  describe('toggleSelected', () => {
    it('should return a TOGGLE_SELECTED action', () => {
      expect(toggleSelected('example', '1234'))
        .to.deep.equal({
          type: TOGGLE_SELECTED,
          objType: 'example',
          selectedIds: ['1234'],
        });
    });
  });
});
