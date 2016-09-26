import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Header from '../../src/components/Header';

describe('components/Header', () => {
  it('renders infobar and navigation components', () => {
    const header = shallow(
      <Header username="user" title="" link="" />
    );

    expect(header.find('Navigation').length).to.equal(1);
    expect(header.find('Infobar').length).to.equal(1);
  });
});
