import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { Dropdown } from 'linode-components/dropdowns';

describe('components/Dropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders dropdown component 2', () => {
    const dropdown = mount(
      <Dropdown
        groups={[
          { elements: [{ action: () => {}, name: 'Drew' }] },
          { elements: [
            { action: () => {}, name: 'Phil' },
            { action: () => {}, name: 'Will' },
          ] },
        ]}
      />
    );

    expect(dropdown.find('.Dropdown-first').text()).to.equal('Drew');

    expect(dropdown.find('.Dropdown-item').length).to.equal(2);
    expect(dropdown.find('.Dropdown-item').at(0).text()).to.equal('Phil');
    expect(dropdown.find('.Dropdown-item').at(1).text()).to.equal('Will');
  });

  it('clickable dropdown', () => {
    const clickFirst = sandbox.spy();
    const clickBodyItem = sandbox.spy();
    const unclicked = sandbox.spy();
    const dropdown = mount(
      <Dropdown
        groups={[
          { elements: [{ action: clickFirst, name: 'Drew' }] },
          { elements: [
            { action: clickBodyItem, name: 'Phil' },
            { action: unclicked, name: 'Will' },
          ]}
        ]}
      />
    );

    // Click first item should trigger clickFirst
    dropdown.find('.Dropdown-first').simulate('click');
    // Click toggle should open body
    dropdown.find('.Dropdown-toggle').simulate('click');
    // Click first menu item should trigger clickBodyItem
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    // Last menu item goes unclicked

    expect(clickFirst.callCount).to.equal(1);
    expect(dropdown.find('.Dropdown--open').length).to.equal(1);
    expect(clickBodyItem.callCount).to.equal(1);
    expect(unclicked.callCount).to.equal(0);

    // Mousedown did not hide dropdown
    expect(dropdown.find('.Dropdown--open').length).to.equal(1);
    // But onblur does
    dropdown.find('.Dropdown').simulate('blur');
    expect(dropdown.find('.Dropdown--open').length).to.equal(0);
  });

  it('closes on second click', () => {
    const noAction = () => {};
    const dropdown = mount(
      <Dropdown
        groups={[
          { elements: [{ action: noAction, name: '' }] },
          { elements: [{ action: noAction, name: '' }] },
        ]}
      />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    expect(dropdown.find('.Dropdown--open').length).to.equal(1);
    dropdown.find('.Dropdown-toggle').simulate('click');
    expect(dropdown.find('.Dropdown--open').length).to.equal(0);
  });

  it('closes on blur', () => {
    const noAction = () => {};
    const dropdown = mount(
      <Dropdown
        groups={[
          { elements: [{ action: noAction, name: '' }] },
          { elements: [{ action: noAction, name: '' }] },
        ]}
      />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    expect(dropdown.find('.Dropdown--open').length).to.equal(1);
    dropdown.find('.Dropdown-toggle').simulate('blur');
    expect(dropdown.find('.Dropdown--open').length).to.equal(0);
  });
});
