import React, { Component } from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { Tabs } from 'linode-components/tabs';

describe('components/Tabs', async () => {
  // eslint-disable-next-line react/prefer-stateless-function
  class Test extends Component {
    render() {
      // eslint-disable-next-line react/prop-types
      return <Tabs tabs={this.props.tabs} onClick={this.props.onClick} />;
    }
  }

  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();
  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const tabs = [
    { name: 'One', link: '/one' },
    { name: 'Two', link: '/two' },
  ];

  it('renders tabs', () => {
    const page = mount(
      <Test
        dispatch={dispatch}
        tabs={tabs}
      />);

    const tabComponents = page.find('Tabs').find('Tab');
    expect(tabComponents.length).to.equal(tabs.length);
    tabs.forEach(({ name, link }, i) => {
      expect(tabComponents.at(i).children().text()).to.equal(name);
    });
  });

  it('supports click handling on tabs', () => {
    const handleClick = sandbox.spy();
    const page = mount(
      <Test
        dispatch={dispatch}
        tabs={tabs}
        onClick={handleClick}
      />
    );

    const tabComponents = page.find('Tabs').find('Tab');
    tabComponents.at(0).simulate('click');
    expect(handleClick.callCount).to.equal(1);
  });
});
