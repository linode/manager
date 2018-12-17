import { shallow } from 'enzyme';
import * as React from 'react';

import { linodes } from 'src/__data__/groupImports';

import { getGroupImportList, TagImportDrawer } from './TagImportDrawer'

const props = {
  actions: {
    update: jest.fn(),
    close: jest.fn(),
  },
  open: true,
  errors: [],
  loading: false,
  success: false,
  entitiesWithGroupsToImport: { linodes },
  onPresentSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  classes: { root: ''}
}

const component = shallow(<TagImportDrawer {...props} />);

const errors = [
  { reason: 'hello', entityId: 123, entityLabel: 'entity1'},
  { reason: 'one', entityId: 234, entityLabel: 'entity2'},
  { reason: 'two', entityId: 345, entityLabel: 'entity3'},
]

describe('TagImportDrawer', () => {
  describe('getGroupImportList function', () => {
    it("should return a unique list of groups", () => {
      expect(getGroupImportList(linodes)).toEqual(['group1', 'group2']);
    });
    it("should default to an empty array", () => {
      expect(getGroupImportList([])).toEqual([]);
    });
  });
  describe("Component", () => {
    it("should render", () => {
      expect(component).toBeDefined();
    });
    it("should display a Notice for each error", () => {
      component.setProps({ errors });
      expect(component.find('[data-qa-import-error]')).toHaveLength(errors.length);
    });
    it("should call update() when the Import button is clicked", () => {
      component.find('[data-qa-submit]').simulate('click');
      expect(props.actions.update).toHaveBeenCalled();
    });
    it("should call close() when the cancel button is clicked", () => {
      component.find('[data-qa-cancel]').simulate('click');
      expect(props.actions.close).toHaveBeenCalled();
    });
  });
});