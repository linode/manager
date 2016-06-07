import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import detail from '~/linodes/reducers/detail';
import * as actions from '~/linodes/actions/detail';

describe('linodes/detail reducer', () => {
  it('should handle initial state', () => {
    expect(
      detail(undefined, {})
    ).to.be.eql({
      tab: 0,
      editing: false,
      label: '',
      group: '',
    });
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

  it('should handle TOGGLE_EDIT_MODE', () => {
    const state = { tab: 0, editing: false, label: '', group: '' };
    deepFreeze(state);

    expect(detail(state, actions.toggleEditMode()))
      .to.have.property('editing').that.equals(true);

    const stateEditing = { tab: 0, editing: true, label: '', group: '' };
    deepFreeze(stateEditing);

    expect(detail(stateEditing, actions.toggleEditMode()))
      .to.have.property('editing').that.equals(false);
  });

  it('should handle SET_LINODE_LABEL', () => {
    const state = { tab: 0, editing: false, label: '', group: '' };
    deepFreeze(state);

    expect(detail(state, actions.setLinodeLabel('asdf')))
      .to.have.property('label').that.equals('asdf');
  });

  it('should handle SET_LINODE_GROUP', () => {
    const state = { tab: 0, editing: false, label: '', group: '' };
    deepFreeze(state);

    expect(detail(state, actions.setLinodeGroup('asdf')))
      .to.have.property('group').that.equals('asdf');
  });
});
