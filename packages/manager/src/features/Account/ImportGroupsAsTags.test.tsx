import { shallow } from 'enzyme';
import * as React from 'react';
import { ImportGroupsAsTags } from './ImportGroupsAsTags';

const classes = { root: '', helperText: '' };

const props = {
  classes,
  openDrawer: jest.fn()
};

const component = shallow(<ImportGroupsAsTags {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should open the tag import drawer on click', () => {
    component
      .find('[data-qa-opdsadefdsfn-imp-drawer-button]')
      .simulate('click');
    expect(props.openDrawer).toHaveBeenCalled();
  });
});
