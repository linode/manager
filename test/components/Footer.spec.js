import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Footer from '../../src/components/Footer';

describe('components/Footer', () => {
  it('renders Footer links and attributions', () => {
    const footer = shallow(
      <Footer year="2016" />
    );

    expect(footer.find('span').at(0).text()).to.equal('© 2016 Linode, LLC');
    expect(footer.find({ href: 'https://www.linode.com/tos' }).length).to.equal(1);
    expect(footer.find({ href: 'https://www.linode.com/privacy' }).length).to.equal(1);
  });
});
