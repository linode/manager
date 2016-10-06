import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { IndexPage } from '~/linodes/linode/backups/layouts/IndexPage';
import * as LinodePage from '~/linodes/linode/layouts/IndexPage';

describe('linodes/linode/backups/layouts/IndexPage', () => {
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
      { name: 'Summary', link: '/' },
      { name: 'History', link: '/history' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/1235/backups${t.link}` }));

    const tabs = page.find('Tabs').find('Tab');
    expect(tabs.length).to.equal(tabList.length);
    tabList.forEach(({ name, link }, i) => {
      const a = tabs.at(i).find({ to: link });
      expect(a.children().text()).to.equal(name);
    });
  });
});
