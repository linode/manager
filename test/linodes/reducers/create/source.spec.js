import { expect } from 'chai';
import create from '~/linodes/reducers/create/source';
import * as actions from '~/linodes/actions/create/source';
import deepFreeze from 'deep-freeze';

describe('linodes/reducers/create/source', () => {
  const initialState = {
    sourceTab: 0,
    source: null,
  };
  deepFreeze(initialState);

  it('should handle initial state', () => {
    expect(
      create(undefined, {})
    ).to.deep.eql(initialState);
  });

  it('should no-op on arbitrary actions', () => {
    expect(
      create(initialState, { type: 'foobar' })
    ).to.deep.eql(initialState);
  });

  it('should handle CHANGE_SOURCE_TAB', () => {
    const state = { ...initialState };
    deepFreeze(state);
    expect(
      create(state, actions.changeSourceTab(2))
    ).to.have.property('sourceTab').that.equals(2);
  });

  it('should handle SELECT_SOURCE', () => {
    const state = { ...initialState };
    deepFreeze(state);
    expect(
      create(state, actions.selectSource('distro_1234'))
    ).to.have.property('source').that.equals('distro_1234');
  });
});
