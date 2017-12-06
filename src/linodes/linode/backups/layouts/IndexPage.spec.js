import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode, testLinode1235 } from '~/data/linodes';
import { IndexPage } from '~/linodes/linode/backups/layouts/IndexPage';

describe('linodes/linode/backups/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it.skip('renders tabs with correct names and links with backups enabled', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const tabList = [
      { name: 'Summary', link: '/' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/test-linode/backups${t.link}` }));

    const tabs = page.find('Tabs').find('Tab');
    expect(tabs.length).toBe(tabList.length);
    tabList.forEach(({ name }, i) => {
      expect(tabs.at(i).children().text()).toBe(name);
    });
  });

  it.skip('renders enable backup page when backups are disabled', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode1235}
      />
    );

    expect(page.find('Tabs').length).toBe(0);

    const form = page.find('Form');
    expect(form.text()).to.contain('$2.50');

    const button = form.find('button');
    expect(button.length).toBe(1);
    dispatch.reset();
    await form.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1235/backups/enable', {
        method: 'POST',
      }),
    ]);
  });
});
