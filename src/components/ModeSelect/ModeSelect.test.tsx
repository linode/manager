import { shallow } from 'enzyme';
import * as React from 'react';

import { ModeSelect } from './ModeSelect';

const classes = { root: '' };
const modes = [
  {
    label: 'Edit',
    mode: 'edit'
  },
  {
    label: 'Delete',
    mode: 'delete'
  }
];

const props = {
  classes,
  modes,
  selected: 'edit',
  onChange: jest.fn()
};

const component = shallow(<ModeSelect {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render a radio button for each mode', () => {
    expect(component.find('[data-qa-radio]')).toHaveLength(2);
  });
});
