import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { CreatePage } from '~/support/layouts/CreatePage';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';


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

    changeInput(page, 'summary', 'My new ticket!');
    changeInput(page, 'regarding', `linode_id:${testLinode.id}`);
    changeInput(page, 'description', 'This is my new description!');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      ([fn]) => expectRequest(fn, '/support/tickets/', {
        method: 'POST',
        body: {
          linode_id: testLinode.id,
          summary: 'My new ticket!',
          description: 'This is my new description!',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/support/2')),
    ], 2, [{ id: 2 }]);
  });
});
