import { shallow } from 'enzyme';
import * as React from 'react';

import { DisplayGroupList } from './DisplayGroupList';

const classes = { root: '', groupBox: '', groupItem: '' };

const props = {
  classes,
  groups: ['group1', 'group2'],
  entity: 'Linode' as 'Linode' | 'Domain'
};

const component = shallow(<DisplayGroupList {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render each group', () => {
    expect(component.find('[data-qa-display-group-item]')).toHaveLength(2);
  });
  it('should not render if no groups are provided', () => {
    expect(DisplayGroupList({ ...props, groups: [] })).toBeNull();
  });
});
