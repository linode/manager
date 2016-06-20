import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import modal from '~/reducers/modal';
import * as actions from '~/actions/modal';

describe('reducers/modal', () => {
  it('should handle SHOW_MODAL', () => {
    const state = {};
    deepFreeze(state);

    expect(modal(state, {
      type: actions.SHOW_MODAL,
      title: 'title',
      body: 'body',
    })).to.be.eql({
      title: 'title',
      body: 'body',
      open: true,
    });
  });

  it('should handle HIDE_MODAL', () => {
    const state = {};
    deepFreeze(state);

    expect(modal(state, {
      type: actions.HIDE_MODAL,
      title: 'title',
      body: 'body',
    })).to.be.eql({
      title: 'title',
      body: 'body',
      open: false,
    });
  });

  it('should handle anything else', () => {
    const state = {};
    deepFreeze(state);

    expect(modal(state, {})).to.be.deep.eql(state);
  });
});
