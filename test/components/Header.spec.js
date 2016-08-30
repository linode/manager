import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Header from '../../src/components/Header';
import Navigation from '../../src/components/Navigation';
import Infobar from '../../src/components/Infobar';

describe('components/Header', () => {
  it('renders infobar and navigation components', () => {
    const header = shallow(
      <Header username="user" title="" link="" />
    );

    expect(header.find(<Navigation username="user" />)).to.exist;
    expect(header.find(<Infobar />)).to.exist;
  });
});
