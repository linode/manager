import { vi } from 'vitest';
import { shallow } from 'enzyme';
import * as React from 'react';
import ImportGroupsAsTags from './ImportGroupsAsTags';

const classes = { root: '', helperText: '' };

const props = {
  classes,
  openDrawer: vi.fn(),
};

const component = shallow(<ImportGroupsAsTags {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should open the tag import drawer on click', () => {
    component.find('[data-qa-open-import-drawer-button]').simulate('click');
    expect(props.openDrawer).toHaveBeenCalled();
  });
});
