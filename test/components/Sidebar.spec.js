import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import Sidebar from '../../src/components/Sidebar';
import { LOGIN_ROOT } from '~/constants';

describe('components/Sidebar', () => {
  it('renders sidebar component', () => {
    const sidebar = mount(
      <Sidebar path="/linodes" />
    );

    expect(sidebar.find('li').length).to.equal(6);
    expect(sidebar.find('li').at(0).text()).to.equal('Linodes');
    expect(sidebar.find('li').at(1).text()).to.equal('NodeBalancers');
    expect(sidebar.find('li').at(2).text()).to.equal('Longview');
    expect(sidebar.find('li').at(3).text()).to.equal('DNS Zones');
    expect(sidebar.find('li').at(4).text()).to.equal('Account');
    expect(sidebar.find('li').at(5).text()).to.equal('Support');
    expect(sidebar.find('li.active').length).to.equal(1);
  });

  it('renders sidebar component highlight only once', () => {
    const sidebar = mount(
      <Sidebar path="/nodebalancers/24/linodes" />
    );

    expect(sidebar.find('li.active').length).to.equal(1);
    expect(sidebar.find('li.active').text()).to.equal('NodeBalancers');
  });

  it('renders sidebar links', () => {
    const sidebar = shallow(
      <Sidebar path="/linodes" />
    );

    expect(sidebar.find({ to: '/linodes' }).length).to.equal(1);
    expect(sidebar.find({ to: '/nodebalancers' }).length).to.equal(1);
    expect(sidebar.find({ to: '/longview' }).length).to.equal(1);
    expect(sidebar.find({ to: '/dnszones' }).length).to.equal(1);
    expect(sidebar.find({ href: `${LOGIN_ROOT}/account` }).length).to.equal(1);
    expect(sidebar.find({ to: '/support' }).length).to.equal(1);
  });
});
