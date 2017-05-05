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
        name="password"
        value=""
      />);

    input.find('Input').simulate('change', { target: { value: 'password' } });

    expect(change.callCount).to.equal(1);
  });

  it('should calculate password strength', () => {
    const input = mount(
      <PasswordInput
        value="test/components/form/PasswordInput.spec.js"
        onChange={() => {}}
        name="password"
      />
    );

    expect(input.find('.PasswordInput-strength--4').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').length).to.equal(1);
    expect(input.find('.PasswordInput-strength-text').text())
      .to.equal('Strong');
  });
});
