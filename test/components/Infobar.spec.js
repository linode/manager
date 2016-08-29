import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Infobar from '~/components/Infobar';

describe('components/Infobar', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders Infobar nav component', () => {
    const infobar = shallow(<Infobar title="" link="" />);

    expect(infobar.find('.fa-github')).to.exist;
    expect(infobar.find('.fa-twitter')).to.exist;
  });

  it('renders links', () => {
    const infobar = shallow(<Infobar title="" link="" />);

    expect(infobar.find({ to: 'https://github.com/linode' })).to.exist;
    expect(infobar.find({ to: 'https://twitter.com/linode' })).to.exist;
  });

  it('renders the latest blog post', () => {
    const infobar = shallow(<Infobar title="hello" link="https://example.org" />);

    const link = infobar.find('a').first();
    expect(link.text()).to.equal('hello');
  });
});
