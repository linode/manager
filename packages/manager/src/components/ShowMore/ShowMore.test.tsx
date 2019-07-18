import { shallow } from 'enzyme';
import * as React from 'react';

import Chip from 'src/components/core/Chip';
import { ShowMore } from './ShowMore';

const mockRender = jest.fn();
const classes = {
  chip: '',
  label: '',
  popover: '',
  link: ''
};

const props = {
  classes,
  items: ['a', 'b'],
  render: mockRender
};

describe('ShowMore', () => {
  const wrapper = shallow(<ShowMore {...props} />);

  it('should call provided render function with items.', () => {
    expect(mockRender).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should render a chip with items.length', () => {
    expect(wrapper.containsMatchingElement(<Chip label="+2" />)).toBeTruthy();
  });
});
