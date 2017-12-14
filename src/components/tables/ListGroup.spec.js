import React from 'react';
import { mount, shallow } from 'enzyme';

import { ListGroup } from 'linode-components';


describe('components/lists/ListGroup', function () {
  it('should render without error', () => {
    const wrapper = shallow(
      <ListGroup name="Example" />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render a name', function () {
    const listGroup = mount(
      <ListGroup
        name="Example"
      />
    );

    expect(listGroup.find('.ListGroup-label').text()).toBe('Example');
  });
});
