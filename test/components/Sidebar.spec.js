import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Sidebar from '../../src/components/Sidebar';

describe('components/Sidebar', () => {
  it('renders sidebar component highlight only once', () => {
    const sidebar = shallow(
      <Sidebar path="/nodebalancers/24/linodes" />
    );

    expect(sidebar.find('li.active').length).to.equal(1);
    expect(sidebar.find('li.active').text()).to.equal('NodeBalancers');
  });
});
