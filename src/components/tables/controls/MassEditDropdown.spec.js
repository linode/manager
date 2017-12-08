import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { MassEditDropdown } from 'linode-components';


describe('components/lists/MassEditDropdown', function () {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should be defined', function () {
    expect(MassEditDropdown).toBeDefined();
  });

  it('should render a checkbox and a dropdown', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        groups={[{ elements: [{ name: 'Test', action: () => {} }] }]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.find('input[type="checkbox"]').length).toBe(1);
    expect(massEditDropdown.find('Dropdown').length).toBe(1);
  });

  it('should have a default checked state', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        groups={[{ elements: [{ name: 'Test', action: () => {} }] }]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.props().checked).toBe(false);
  });

  it('should accept a checked state', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        checked
        groups={[{ elements: [{ name: 'Test', action: () => {} }] }]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.props().checked).toBe(true);
  });

  it('should accept an onChange handler', function () {
    const onChange = sandbox.spy();
    const massEditDropdown = mount(
      <MassEditDropdown
        checked
        groups={[{ elements: [{ name: 'Test', action: () => {} }] }]}
        onChange={onChange}
      />
    );

    massEditDropdown.find('input[type="checkbox"]').simulate('change');

    expect(onChange.callCount).toBe(1);
    expect(onChange.getCall(0).args[0]).toBe(true);
  });
});
