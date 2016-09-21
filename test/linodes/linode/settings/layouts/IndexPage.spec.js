import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { Tabs, Tab } from 'react-tabs';
import { api } from '@/data';

import { testLinode } from '@/data/linodes';
import { IndexPage } from '~/linodes/linode/settings/layouts/IndexPage';
import * as LinodePage from '~/linodes/linode/layouts/IndexPage';

describe('linodes/linode/settings/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('calls loadLinode during mount', () => {
    const loadLinode = sandbox.stub(LinodePage, 'loadLinode');
    mount(
      <IndexPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeId: `${testLinode.id}` }}
      />
    );

    expect(loadLinode.calledOnce).to.equal(true);
    loadLinode.restore();
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linodes={api.linodes}
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
