import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { Error } from 'linode-components/errors';



describe('components/Error', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders a 404 component', () => {
    const error = shallow(<Error status={404} />);

    expect(error.find('h1').text()).to.equal('404');
    expect(error.find('h2').text()).to.equal('Whoops!');
    expect(error.find('p').text()).to.equal(
      'The page you\'re trying to reach does not exist. Bummer!');
  });

  it('renders a 400 component', () => {
    const error = shallow(<Error status={400} description="foobar" />);

    expect(error.find('h1').text()).to.equal('400');
    expect(error.find('h2').text()).to.equal('Doh!');
    expect(error.find('p').text()).to.equal(
      'You are not authorized to access this page. foobar');
  });

  it('renders a 500 component', () => {
    const error = shallow(<Error status={500} href="foobar" />);

    expect(error.find('h1').text()).to.equal('500');
    expect(error.find('h2').text()).to.equal('Uh-oh!');
    expect(error.find({ href: 'foobar' }).text()).to.equal(
      'contact support');
  });
});
