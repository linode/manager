import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { index } from '~/linodes/reducers';
import * as actions from '~/linodes/actions';

describe('linodes/index reducer', () => {
  it('should handle initial state', () => {
    expect(
      index(undefined, {})
    ).to.be.eql({ selected: { } });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { selected: { } };
    deepFreeze(state);

    expect(index(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should add to the selection on TOGGLE_SELECTED', () => {
    const state = { selected: { } };
    deepFreeze(state);

    expect(index(state, actions.toggleSelected('1234')))
      .to.have.property('selected')
      .which.has.property('1234');

    expect(index(state, {
      type: actions.TOGGLE_SELECTED,
      selected: ['1234', '1235'],
    })).to.have.property('selected')
      .which.has.keys('1234', '1235');
  });

  it('should remove from the selection on TOGGLE_SELECTED', () => {
    const state = { selected: {
      1234: true,
      1235: true,
    } };
    deepFreeze(state);

    expect(index(state, actions.toggleSelected('1234')))
      .to.have.property('selected')
      .which./* does*/not.have.property('1234');

    expect(index(state, actions.toggleSelected('1234')))
      .to.have.property('selected')
      .which.has.keys('1235');
  });
});
