import * as React from 'react';
import { mount } from 'enzyme';
import ActionMenu from './ActionMenu';

describe('ActionMenu', () => {
  const action = { title: 'whatever', onClick: () => undefined };

  it('should render a link when provided one action.', () => {
    const result = mount(<ActionMenu actions={[action]} />);
    expect(result.find('a')).toHaveLength(1);
  });
  
  it('should render a menu when provided many actions.', () => {
    const result = mount(<ActionMenu actions={[action, action, action]} />);
    expect(result.find('WithStyles(ActionMenu)')).toHaveLength(1);

    result.find('IconButton').simulate('click');
    expect(result.find('WithStyles(MenuItem)')).toHaveLength(3);
  });
});
