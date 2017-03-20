import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { CreatePage } from '~/support/layouts/CreatePage';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';
import { expectRequest } from '@/common';

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
        dnszones={api.dnszones.dnszones}
        nodebalancers={api.nodebalancers.nodebalancers}
        dispatch={dispatch}
      />
    );

    const changeInput = (type, id, value) =>
      page.find(type).find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('Input', 'summary', 'My new ticket!');
    changeInput('Select', 'regarding', `Linodes-${testLinode.id}`);
    changeInput('textarea', 'description', 'This is my new description!');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    // One call to save the data, one call to redirect.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/support/tickets/', {
      method: 'POST',
      body: {
        linode_id: testLinode.id,
        summary: 'My new ticket!',
        description: 'This is my new description!',
      },
    });
  });
});
