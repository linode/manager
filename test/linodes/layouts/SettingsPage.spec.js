import React from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { Tabs, Tab } from 'react-tabs';

import { testLinode } from '~/../test/data';
import { SettingsPage } from '~/linodes/layouts/SettingsPage';

describe('linodes/layouts/SettingsPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: { ...testLinode, id: 'linode_1235', group: '' },
      linode_1236: { ...testLinode, id: 'linode_1236', state: 'offline' },
      linode_1237: { ...testLinode, id: 'linode_1236', state: 'booting' },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };

  it('renders settings tabs', () => {
    const page = shallow(
      <SettingsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
      />);
    const tabs = page.find(Tabs);
    expect(tabs).to.exist;
    const expectedTabs = [
      'Boot settings', 'Alerts', 'Advanced',
    ];
    expect(tabs.find(Tab).length).to.equal(expectedTabs.length);
    expect(tabs.find(Tab).filter(t => t.text() === t)).to.exist;
  });

  it('dispatches a push action when tabs are clicked', () => {
    const page = shallow(
      <SettingsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
      />);
    const tabs = page.find(Tabs);
    tabs.props().onSelect(2);
    expect(dispatch.calledWith(push('/linodes/linode_1234/settings/advanced'))).to.equal(true);
  });
});
