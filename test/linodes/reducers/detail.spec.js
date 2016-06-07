import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import detail from '~/linodes/reducers/detail';
import * as actions from '~/linodes/actions/detail';

describe('linodes/detail reducer', () => {
  it('should handle initial state', () => {
    expect(
      detail(undefined, {})
    ).to.be.eql({ tab: 0 });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { tab: 0 };
    deepFreeze(state);

    expect(detail(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should handle CHANGE_DETAIL_TAB', () => {
    const state = { tab: 0 };
    deepFreeze(state);

    expect(detail(state, actions.changeDetailTab(3)))
      .to.have.property('tab').that.equals(3);
  });
});
