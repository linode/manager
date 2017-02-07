import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { PasswordInput } from '~/components/form';

describe('components/form/PasswordInput', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('calls onChange when appropriate', () => {
    const change = sandbox.spy();
    const input = shallow(
      <PasswordInput
        onChange={change}
      />);

    input.find('Input').simulate('change',
                                  { target: { value: 'p@ssword' } });

    expect(change.callCount).to.equal(1);
    expect(change.firstCall.args[0]).to.equal('p@ssword');
  });

  it('should calculate password strength', () => {
    const input = mount(
      <PasswordInput
        onChange={() => {}}
      />);

    input.find('input').simulate('change',
      { target: { value: 'correct horse battery staple' } });
    expect(input.find('.PasswordInput-strength--4').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').text())
      .to.equal('Strong');
  });
});
