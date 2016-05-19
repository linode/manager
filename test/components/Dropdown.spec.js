import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';
import { expect } from 'chai';
import Dropdown from '../../src/components/Dropdown';

describe('Dropdown', () => {
  it('renders dropdown component', () => {
    const dropdown = renderIntoDocument(
      <Dropdown elements={[
        { action: function test(){}, name: "Drew" },
        { action: function test(){}, name: "Phil" },
        { action: function test(){}, name: "Will" }
      ]} />
    );

    const list = scryRenderedDOMComponentsWithClass(dropdown, 'li-dropdown-item');

    expect(list.length).to.equal(3);
    expect(list[0].textContent).to.equal('Drew');
    expect(list[1].textContent).to.equal('Phil');
    expect(list[2].textContent).to.equal('Will');
  });

  it('clickable dropdown', () => {
    const clickFirst = sinon.spy();
    const clickBodyItem = sinon.spy();
    const unclicked = sinon.spy();
    const dropdown = mount(
      <Dropdown elements={[
        { action: clickFirst, name: "Drew" },
        { action: clickBodyItem, name: "Phil" },
        { action: unclicked, name: "Will" }
      ]} />
    );

    dropdown.find('.li-dropdown-first').first().simulate('click');
    dropdown.find('.li-dropdown-body').find('.li-dropdown-item').first().simulate('click');

    expect(clickFirst.calledOnce).to.equal(true);
    expect(clickBodyItem.calledOnce).to.equal(true);
    expect(unclicked.calledOnce).to.equal(false);
  });
});
