import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { PasswordInput } from 'linode-components/forms';

describe('components/forms/PasswordInput', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('calls onChange when appropriate', () => {
    const change = sandbox.spy();
    const input = shallow(
      <PasswordInput
        onChange={change}
        value=""
      />);

    input.find('Input').simulate('change', { target: { value: 'p@ssword' } });

    expect(change.callCount).to.equal(1);
  });

  it('should calculate password strength', () => {
    const state = { password: '' };
    const input = mount(
      <PasswordInput
        onChange={({ target: { value } }) => { state.password = value; }}
        value={state.password}
        name="password"
      />
    );

    input.find('input').simulate('change', { target: { value: 'correct horse battery staple' } });
    console.log(input.debug());
    expect(input.find('.PasswordInput-strength--4').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').text())
      .to.equal('Strong');
  });
});
