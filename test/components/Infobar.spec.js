import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import Infobar from '~/components/Infobar';

describe('components/Infobar', () => {
  it('renders Infobar nav component', () => {
    const infobar = mount(
      <Infobar />
    );

    expect(infobar.find('.fa-github')).to.exist;
    expect(infobar.find('.fa-twitter')).to.exist;
  });

  it('renders links', () => {
    const infobar = shallow(
      <Infobar />
    );

    expect(infobar.find({ to: 'https://github.com/linode' })).to.exist;
    expect(infobar.find({ to: 'https://twitter.com/linode' })).to.exist;
  });
});
