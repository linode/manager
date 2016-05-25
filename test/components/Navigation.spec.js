import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import Navigation from '../../src/components/Navigation';

describe('Navigation', () => {
  it('renders username', () => {
    const navigation = mount(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find('.nav-user').text()).to.equal('peanut');
  });

  it('renders username account link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find({ href: '/account' }).length).to.equal(1);
  });

  it('renders logout', () => {
    const navigation = mount(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find('.nav-logout').text()).to.equal('Logout');
  });

  it('renders logout link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find({ href: '/logout' }).length).to.equal(1);
  });

  it('renders logo image', () => {
    const navigation = mount(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find('img').src).to.be.defined;
  });

  it('renders logo image home link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find({ to: '/' }).length).to.equal(1);
  });

  it('renders navigation links', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} />
    );

    expect(navigation.find({ href: 'https://www.linode.com/docs/' }).length).to.equal(1);
    expect(navigation.find({ href: 'https://forum.linode.com' }).length).to.equal(1);
    expect(navigation.find({ href: 'https://developers.linode.com' }).length).to.equal(1);
  });
});
