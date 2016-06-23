import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { Tabs, Tab } from 'react-tabs';

import { testLinode } from '~/../test/data';
import { IndexPage } from '~/linodes/settings/layouts/IndexPage';
import * as LinodeDetailPage from '~/linodes/layouts/LinodeDetailPage';

describe('linodes/settings/layouts/IndexPage', () => {
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

  it('calls loadLinode during mount', async() => {
    LinodeDetailPage.loadLinode = sinon.spy();
    mount(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
      />
    );

    expect(LinodeDetailPage.loadLinode.calledOnce).to.equal(true);
    LinodeDetailPage.loadLinode.reset();
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
      />
    );

    const tabList = [
      { name: 'Boot settings', link: '' },
      { name: 'Alerts', link: '/alerts' },
      { name: 'Advanced', link: '/advanced' },
    ].map(t => ({ ...t, link: `/linodes/linode_1235/settings${t.link}` }));

    const tabs = page.find(Tabs);
    tabList.forEach(({ name, link }) => {
      expect(tabs.find(Tab).filter(t => t.text() === name)).to.exist;
      expect(tabs.find(Tab).filter(t => t.To === link)).to.exist;
    });
  });
});
