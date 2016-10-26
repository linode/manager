import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import notifications from '~/reducers/notifications';
import * as actions from '~/actions/notifications';

describe('reducers/notifications', () => {
  it('should handle SHOW_NOTIFICATIONS', () => {
    const state = {};
    deepFreeze(state);

    expect(notifications(state, {
      type: actions.SHOW_NOTIFICATIONS,
    })).to.be.eql({
      open: true,
    });
  });

  it('should handle HIDE_NOTIFICATIONS', () => {
    const state = {};
    deepFreeze(state);

    expect(notifications(state, {
      type: actions.HIDE_NOTIFICATIONS,
    })).to.be.eql({
      open: false,
    });
  });

  it('should handle anything else', () => {
    const state = {};
    deepFreeze(state);

    expect(notifications(state, {})).to.equal({});
  });
});
