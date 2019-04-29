import { shallow } from 'enzyme';
import * as React from 'react';
import { domains, linodes } from 'src/__data__/groupImports';
import { sendEvent } from 'src/utilities/analytics';
import {
  createLabel,
  getGroupImportList,
  TagImportDrawer,
  withUpdates
} from './TagImportDrawer';
jest.mock('src/utilities/analytics', () => ({
  sendEvent: jest.fn()
}));

const props = {
  actions: {
    update: jest.fn(),
    close: jest.fn()
  },
  open: true,
  errors: [],
  loading: false,
  success: false,
  entitiesWithGroupsToImport: { domains, linodes },
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  classes: { root: '' }
};

const EnhancedComponent = withUpdates(TagImportDrawer);
const wrapper = shallow(<EnhancedComponent {...props} />);
const component = wrapper.dive();

const errors = [
  { reason: 'hello', entityId: 123, entityLabel: 'entity1' },
  { reason: 'one', entityId: 234, entityLabel: 'entity2' },
  { reason: 'two', entityId: 345, entityLabel: 'entity3' }
];

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
      component.setProps({ errors });
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
    expect(sendEvent).toHaveBeenCalled();
  });

  it('should send a GA event with the number of Linodes and Domains with imported tags', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Linodes: 3; Domains: 2'
      })
    );
  });

  it('should send a GA event with category of "Dashboard"', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'dashboard'
      })
    );
  });

  it('should send a GA event with value of number of Linodes + number of Domains', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 5
      })
    );
  });

  it('should send a GA event with action of "import display groups"', () => {
    component.find('[data-qa-submit]').simulate('click');
    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'import display groups'
      })
    );
  });
});

describe('GA Label Creator', () => {
  it('should return the number of Linodes and number of Domains', () => {
    expect(createLabel(0, 3)).toBe('Linodes: 0; Domains: 3');
    expect(createLabel(0, 0)).toBe('Linodes: 0; Domains: 0');
    expect(createLabel(8, 123)).toBe('Linodes: 8; Domains: 123');
  });

  it('should clamp values if num > 9999', () => {
    expect(createLabel(1, 10000)).toBe('Linodes: 1; Domains: 9999+');
    expect(createLabel(99999999, 99999999)).toBe(
      'Linodes: 9999+; Domains: 9999+'
    );
  });
});
