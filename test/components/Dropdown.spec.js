import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect, assert } from 'chai';
import Dropdown from '../../src/components/Dropdown';

describe('components/Dropdown', () => {
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

    expect(dropdown.find('.li-dropdown-item').length).to.equal(3);
    expect(dropdown.find('.li-dropdown-item').at(0).text()).to.equal('Drew');
    expect(dropdown.find('.li-dropdown-item').at(1).text()).to.equal('Phil');
    expect(dropdown.find('.li-dropdown-item').at(2).text()).to.equal('Will');
  });

  it('clickable dropdown', () => {
    const clickFirst = sinon.spy();
    const clickBodyItem = sinon.spy();
    const unclicked = sinon.spy();
    const dropdown = mount(
      <Dropdown
        elements={[
          { action: clickFirst, name: 'Drew' },
          { action: clickBodyItem, name: 'Phil' },
          { action: unclicked, name: 'Will' },
        ]}
      />
    );

    dropdown.find('.li-dropdown-first').first().simulate('click');
    dropdown.find('.li-dropdown-body')
      .find('.li-dropdown-item')
      .first()
      .simulate('click');

    assert.isTrue(clickFirst.calledOnce);
    assert.isTrue(clickBodyItem.calledOnce);
    assert.isFalse(unclicked.calledOnce);
  });
});
