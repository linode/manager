import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { CreatePage } from '~/support/layouts/CreatePage';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';


describe('support/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('opens a ticket', async () => {
    const page = mount(
      <CreatePage
        linodes={api.linodes.linodes}
        domains={api.domains.domains}
        nodebalancers={api.nodebalancers.nodebalancers}
        dispatch={dispatch}
      />
    );

    const changeInput = (type, id, value) =>
      page.find(type).find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('Input', 'summary', 'My new ticket!');
    changeInput('Select', 'regarding', `linode_id:${testLinode.id}`);
    changeInput('textarea', 'description', 'This is my new description!');

    dispatch.reset();
    await page.find('Form').simulate('submit');
    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      async ([fn]) => await expectRequest(
        fn, '/support/tickets/', {
          method: 'POST',
          body: {
            linode_id: testLinode.id,
            summary: 'My new ticket!',
            description: 'This is my new description!',
          },
        }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/support/')),
    ]);
  });
});
