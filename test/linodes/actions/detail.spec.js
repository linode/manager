import { expect } from 'chai';
import * as actions from '~/linodes/actions/detail';

describe('linodes/actions/detail', () => {
  describe('changeDetailTab', () => {
    it('should return a CHANGE_DETAIL_TAB action', () => {
      expect(actions.changeDetailTab(1))
        .to.deep.equal({
          type: actions.CHANGE_DETAIL_TAB,
          index: 1,
        });
    });
  });
});
