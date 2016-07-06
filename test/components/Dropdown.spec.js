import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Dropdown from '../../src/components/Dropdown';

describe('components/Dropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders dropdown component 2', () => {
    const dropdown = mount(
      <Dropdown
        elements={[
          { action: () => {}, name: 'Drew' },
          { action: () => {}, name: 'Phil' },
          { action: () => {}, name: 'Will' },
        ]}
      />
    );

    expect(dropdown.find('.dropdown-first').text()).to.equal('Drew');

    expect(dropdown.find('.dropdown-item').length).to.equal(2);
    expect(dropdown.find('.dropdown-item').at(0).text()).to.equal('Phil');
    expect(dropdown.find('.dropdown-item').at(1).text()).to.equal('Will');
  });

  it('clickable dropdown', () => {
    const clickFirst = sandbox.spy();
    const clickBodyItem = sandbox.spy();
    const unclicked = sandbox.spy();
    const dropdown = mount(
      <Dropdown
        elements={[
          { action: clickFirst, name: 'Drew' },
          { action: clickBodyItem, name: 'Phil' },
          { action: unclicked, name: 'Will' },
        ]}
      />
    );

    // Click first item should trigger clickFirst
    dropdown.find('.dropdown-first').simulate('click');
    // Click toggle should open body
    dropdown.find('.dropdown-toggle').simulate('click');
    // Click first menu item should trigger clickBodyItem
    dropdown.find('.dropdown-item').first().simulate('mousedown');
    // Last menu item goes unclicked

    expect(clickFirst.calledOnce).to.equal(true);
    expect(dropdown.find('.btn-group.open')).to.exist;
    expect(clickBodyItem.calledOnce).to.equal(true);
    expect(unclicked.callCount).to.equal(0);

    // Mousedown did not hide dropdown
    expect(dropdown.find('.btn-group.open')).to.exist;
    // But onblur does
    dropdown.find('.btn-group').simulate('blur');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('closes on second click', () => {
    const noAction = () => {};
    const dropdown = mount(<Dropdown
      elements={[
        { action: noAction, name: '' },
        { action: noAction, name: '' },
      ]}
    />);

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open')).to.exist;
    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('closes on blur', () => {
    const noAction = () => {};
    const dropdown = mount(<Dropdown
      elements={[
        { action: noAction, name: '' },
        { action: noAction, name: '' },
      ]}
    />);

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open')).to.exist;
    dropdown.find('.dropdown-toggle').simulate('blur');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });
});
