import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithTag
} from 'react-addons-test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Sidebar from '../../src/components/Sidebar';

describe('Sidebar', () => {
  it('renders sidebar component', () => {
    const sidebar = renderIntoDocument(
      <Sidebar />
    );

    const list = scryRenderedDOMComponentsWithTag(sidebar, 'li');

    expect(list.length).to.equal(5);
    expect(list[0].textContent).to.equal('Linodes');
    expect(list[1].textContent).to.equal('NodeBalancers');
    expect(list[2].textContent).to.equal('Longview');
    expect(list[3].textContent).to.equal('DNS Manager');
    expect(list[4].textContent).to.equal('Support');
  });

  it('renders sidebar links', () => {
    const sidebar = mount(
      <Sidebar />
    );

    expect(sidebar.find('a').first().href).to.be.defined;
  });
});
