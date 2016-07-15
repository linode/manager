import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import Navigation from '../../src/components/Navigation';

describe('components/Navigation', () => {
  it('renders username', () => {
    const navigation = mount(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find('.nav-user').text()).to.equal('peanut');
  });

  it('renders username account link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find({ href: '/account' }).length).to.equal(1);
  });

  it('renders badge', () => {
    const navigation = mount(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find('.nav-gravatar-badge').text()).to.equal('3');
  });

  it('renders gravatar', () => {
    const navigation = mount(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find('.nav-gravatar-img').src).to.be.defined;
  });

  it('renders username account link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find({ href: '/account' }).length).to.equal(1);
  });

  it('renders logo image', () => {
    const navigation = mount(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find('img').src).to.be.defined;
  });

  it('renders logo image home link', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find({ to: '/' }).length).to.equal(1);
  });

  it('renders navigation links', () => {
    const navigation = shallow(
      <Navigation username={'peanut'} emailHash={'24afd9bad4cf41b3c07d61fa0df03768'} />
    );

    expect(navigation.find({ href: 'https://www.linode.com/docs/' }).length).to.equal(1);
    expect(navigation.find({ href: 'https://forum.linode.com' }).length).to.equal(1);
    expect(navigation.find({ href: 'https://developers.linode.com' }).length).to.equal(1);
  });
});
