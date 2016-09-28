import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import PasswordInput from '~/components/PasswordInput';

describe('components/PasswordInput', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render a password input', () => {
    const input = shallow(
      <PasswordInput
        passwordType="offline_fast_hashing_1e10_per_second"
        onChange={() => {}}
      />);
    expect(input.find('input[type="password"]').length).to.equal(1);
  });

  it('should render a generate button', () => {
    const input = shallow(
      <PasswordInput
        passwordType="offline_fast_hashing_1e10_per_second"
        onChange={() => {}}
      />);
    expect(input.find('button').length).to.equal(1);
    expect(input.find('button').text()).to.equal('Generate');
  });

  it('should render a password strength meter', () => {
    const input = shallow(
      <PasswordInput
        passwordType="offline_fast_hashing_1e10_per_second"
        onChange={() => {}}
      />);
    expect(input.find('.strength').length).to.equal(1);
    expect(input.find('.strength').children()).to.have.length(4);
  });

  it('raises the onChange event when appropriate', () => {
    const change = sandbox.spy();
    const input = shallow(
      <PasswordInput
        passwordType="offline_fast_hashing_1e10_per_second"
        onChange={change}
      />);
    input.find('input[type="password"]').simulate('change',
      { target: { value: 'p@ssword' } });
    expect(change.calledOnce).to.equal(true);
    expect(change.calledWith('p@ssword')).to.equal(true);
  });

  it('should calculate password strength', () => {
    const input = shallow(
      <PasswordInput
        passwordType="offline_fast_hashing_1e10_per_second"
        onChange={() => {}}
      />);
    input.find('input[type="password"]').simulate('change',
      { target: { value: 'p@ssword' } });
    expect(input.find('.strength').hasClass('strength-0'));
    input.find('input[type="password"]').simulate('change',
      { target: { value: 'correct horse battery staple' } });
    expect(input.find('.strength').hasClass('strength-4'));
    expect(input.find('p').length).to.equal(1);
    expect(input.find('p').text())
      .to.equal('An offline attack would take centuries to crack this password.');
  });

  // TODO: password-input doesn't work on the current version of PhantomJS and
  // we can't stub it
  it('should generate a password when generate is clicked');
  it('should render a text input when generated');
});
