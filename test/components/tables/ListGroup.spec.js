import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { ListGroup } from 'linode-components/lists/bodies';


describe('components/lists/ListGroup', function () {
  it('should be defined', function () {
    expect(ListGroup).to.be.defined;
  });

  it('should render a name', function () {
    const listGroup = mount(
      <ListGroup
        name="Example"
      />
    );

    expect(listGroup.find('.ListGroup-label').text()).to.equal('Example');
  });
});
