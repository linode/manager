import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { detail } from '~/linodes/reducers/detail';
import * as actions from '~/linodes/actions/detail/index';

describe('linodes/reducers/detail/index', () => {
  it('should handle initial state', () => {
    expect(
      detail(undefined, {})
    ).to.be.eql({
      editing: false,
      label: '',
      group: '',
      loading: false,
      errors: {
        label: null,
        group: null,
        _: null,
      },
    });
  });

  it('should no-op on arbitrary actions', () => {
    const state = { };
    deepFreeze(state);

    expect(detail(state, { type: 'foobar' }))
      .to.deep.equal(state);
  });

  it('should handle TOGGLE_EDIT_MODE', () => {
    const state = { editing: false };
    deepFreeze(state);

    expect(detail(state, actions.toggleEditMode()))
      .to.have.property('editing').that.equals(true);

    const stateEditing = { editing: true };
    deepFreeze(stateEditing);

    expect(detail(stateEditing, actions.toggleEditMode()))
      .to.have.property('editing').that.equals(false);
  });

  it('should handle SET_LINODE_LABEL', () => {
    const state = { label: '' };
    deepFreeze(state);

    expect(detail(state, actions.setLinodeLabel('asdf')))
      .to.have.property('label').that.equals('asdf');
  });

  it('should handle SET_LINODE_GROUP', () => {
    const state = { group: '' };
    deepFreeze(state);

    expect(detail(state, actions.setLinodeGroup('asdf')))
      .to.have.property('group').that.equals('asdf');
  });

  it('should handle TOGGLE_LOADING', () => {
    const state = { loading: false };
    deepFreeze(state);

    expect(detail(state, { type: actions.TOGGLE_LOADING }))
      .to.have.property('loading').that.equals(true);

    const stateLoading = { loading: true };
    deepFreeze(state);

    expect(detail(stateLoading, { type: actions.TOGGLE_LOADING }))
      .to.have.property('loading').that.equals(false);
  });

  it('should handle SET_ERRORS', () => {
    const state = { };
    deepFreeze(state);

    expect(detail(state, {
      type: actions.SET_ERRORS,
      label: ['a', 'b', 'c'],
      group: ['a', 'b', 'c'],
      _: null,
    })).to.have.property('errors').that.deep.equals({
      label: ['a', 'b', 'c'],
      group: ['a', 'b', 'c'],
      _: null,
    });
  });
});
