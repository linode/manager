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

  describe('toggleEditMode', () => {
    it('should return a TOGGLE_EDIT_MODE action', () => {
      expect(actions.toggleEditMode())
        .to.deep.equal({
          type: actions.TOGGLE_EDIT_MODE,
        });
    });
  });

  describe('setLinodeLabel', () => {
    it('should return a SET_LINODE_LABEL action', () => {
      expect(actions.setLinodeLabel('asdf'))
        .to.deep.equal({
          type: actions.SET_LINODE_LABEL,
          label: 'asdf',
        });
    });
  });

  describe('setLinodeGroup', () => {
    it('should return a SET_LINODE_GROUP action', () => {
      expect(actions.setLinodeGroup('asdf'))
        .to.deep.equal({
          type: actions.SET_LINODE_GROUP,
          group: 'asdf',
        });
    });
  });
});
