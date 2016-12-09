import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { IndexPage } from '~/linodes/linode/settings/layouts/IndexPage';

describe('linodes/linode/settings/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeId: '1235' }}
      />
    );

    const tabList = [
      { name: 'Display', link: '/' },
      { name: 'Alerts', link: '/alerts' },
      { name: 'Advanced', link: '/advanced' },
    ].map(t => ({ ...t, link: `/linodes/1235/settings${t.link}` }));

    const tabs = page.find('Tabs').find('Tab');
    expect(tabs.length).to.equal(tabList.length);
    tabList.forEach(({ name, link }, i) => {
      expect(tabs.at(i).children().text()).to.equal(name);
    });
  });
});
