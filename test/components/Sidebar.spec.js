import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import Sidebar from '../../src/components/Sidebar';

describe('components/Sidebar', () => {
  it('renders sidebar component', () => {
    const sidebar = mount(
      <Sidebar path="/linodes" />
    );

    expect(sidebar.find('li').length).to.equal(6);
    expect(sidebar.find('li').at(0).text()).to.equal('Linodes');
    expect(sidebar.find('li').at(1).text()).to.equal('NodeBalancers');
    expect(sidebar.find('li').at(2).text()).to.equal('Longview');
    expect(sidebar.find('li').at(3).text()).to.equal('DNS Manager');
    expect(sidebar.find('li').at(4).text()).to.equal('Account');
    expect(sidebar.find('li').at(5).text()).to.equal('Support');
    expect(sidebar.find('li').at(0).find('.active')).to.exist;
  });

  it('renders sidebar links', () => {
    const sidebar = shallow(
      <Sidebar path="/linodes" />
    );

    expect(sidebar.find({ to: '/linodes' }).length).to.equal(1);
    expect(sidebar.find({ to: '/nodebalancers' }).length).to.equal(1);
    expect(sidebar.find({ to: '/longview' }).length).to.equal(1);
    expect(sidebar.find({ to: '/dnsmanager' }).length).to.equal(1);
    expect(sidebar.find({ to: '/account' }).length).to.equal(1);
    expect(sidebar.find({ to: '/support' }).length).to.equal(1);
  });
});
