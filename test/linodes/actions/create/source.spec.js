import { expect } from 'chai';
import * as actions from '~/linodes/actions/create/source';

describe('linodes/actions/create/source', () => {
  describe('changeSourceTab', () => {
    it('should return a CHANGE_SOURCE_TAB action', () => {
      expect(actions.changeSourceTab(2))
        .to.deep.equal({
          type: actions.CHANGE_SOURCE_TAB,
          tab: 2,
        });
    });
  });

  describe('selectSource', () => {
    it('should return a SELECT_SOURCE action', () => {
      expect(actions.selectSource('distro_123'))
        .to.deep.equal({
          type: actions.SELECT_SOURCE,
          source: 'distro_123',
        });
    });
  });
});
