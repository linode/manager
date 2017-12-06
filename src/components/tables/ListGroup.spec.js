import React from 'react';
import { mount } from 'enzyme';

import { ListGroup } from 'linode-components/lists/bodies';


describe('components/lists/ListGroup', function () {
  it('should be defined', function () {
    expect(ListGroup).toBeDefined();
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
