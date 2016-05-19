import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Navigation from '../../src/components/Navigation';

describe('Navigation', () => {
  it('renders username in navigation component', () => {
    const navigation = mount(
      <Navigation username={ 'peanut' } />
    );

    expect(navigation.find('.nav-user').length).to.equal(1);
  });

  it('renders logo image', () => {
    const navigation = mount(
      <Navigation username={ 'peanut' } />
    );
    
    expect(navigation.find('img').src).to.be.defined;
  });
});
