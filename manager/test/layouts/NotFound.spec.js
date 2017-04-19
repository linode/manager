import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import NotFound from '~/layouts/NotFound';

describe('layouts/NotFound', () => {
  it('should return 404 Not Found', () => {
    const content = mount(
      <NotFound />
    );

    expect(content.find('h1').text()).to.equal('404 Not Found');
  });
});
