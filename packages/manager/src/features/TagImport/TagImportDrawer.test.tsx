import { shallow } from 'enzyme';
import * as React from 'react';
import { linodes } from 'src/__data__/groupImports';
import { sendImportDisplayGroupSubmitEvent } from 'src/utilities/ga';
import {
  createLabel,
  getGroupImportList,
  TagImportDrawer,
  withUpdates,
} from './TagImportDrawer';
jest.mock('src/utilities/ga', () => ({
  sendImportDisplayGroupSubmitEvent: jest.fn(),
}));

const errors = [
  { reason: 'hello', entityId: 123, entityLabel: 'entity1' },
  { reason: 'one', entityId: 234, entityLabel: 'entity2' },
  { reason: 'two', entityId: 345, entityLabel: 'entity3' },
];

const props = {
  actions: {
    update: jest.fn(),
    close: jest.fn(),
  },
  open: true,
  errors,
  loading: false,
  success: false,
  entitiesWithGroupsToImport: { linodes },
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  classes: { root: '' },
};

const EnhancedComponent = withUpdates(TagImportDrawer);
const wrapper = shallow(<EnhancedComponent {...props} />);
const component = wrapper.dive();

jest.mock('src/store');

describe('TagImportDrawer', () => {
  describe('getGroupImportList function', () => {
    it('should return a unique list of groups', () => {
      expect(getGroupImportList(linodes)).toEqual(['group1', 'group2']);
    });
    it('should default to an empty array', () => {
      expect(getGroupImportList([])).toEqual([]);
    });
  });
  describe('Component', () => {
    it('should render', () => {
      expect(component).toBeDefined();
    });
    it('should display a Notice for each error', () => {
      expect(component.find('[data-qa-import-error]')).toHaveLength(
        errors.length
      );
    });
    it('should call update() when the Import button is clicked', () => {
      component.find('[data-qa-submit]').simulate('click');
      expect(props.actions.update).toHaveBeenCalled();
    });
    it('should call close() when the cancel button is clicked', () => {
      component.find('[data-qa-cancel]').simulate('click');
      expect(props.actions.close).toHaveBeenCalled();
    });
  });

  it('should send a GA event on success', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendImportDisplayGroupSubmitEvent).toHaveBeenCalled();
  });

  it('should send a GA event with the number of Linodes with imported tags', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendImportDisplayGroupSubmitEvent).toHaveBeenCalledWith(
      createLabel(3),
      3
    );
  });

  it('should send a GA event with category of "Dashboard"', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendImportDisplayGroupSubmitEvent).toHaveBeenCalledWith(
      createLabel(3),
      3
    );
  });

  it('should send a GA event with value of number of Linodes', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendImportDisplayGroupSubmitEvent).toHaveBeenCalledWith(
      createLabel(3),
      3
    );
  });

  it('should send a GA event with action of "import display groups"', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendImportDisplayGroupSubmitEvent).toHaveBeenCalledWith(
      createLabel(3),
      3
    );
  });
});

describe('GA Label Creator', () => {
  it('should return the number of Linodes', () => {
    expect(createLabel(0)).toBe('Linodes: 0');
    expect(createLabel(8)).toBe('Linodes: 8');
  });

  it('should clamp values if num > 9999', () => {
    expect(createLabel(99999999)).toBe('Linodes: 9999+');
  });
});
