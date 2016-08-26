import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Footer from '../../src/components/Footer';

describe('components/Footer', () => {
  it('renders Footer links and attributions', () => {
    const footer = shallow(
      <Footer year={2016} />
    );

    expect(footer.find('© 2016 Linode, LLC'));
    expect(footer.find(<a href="https://www.linode.com/tos">Terms of Services</a>)).to.exist;
    expect(footer.find(<a href="https://www.linode.com/privacy">Privacy Policy</a>)).to.exist;
  });
});
