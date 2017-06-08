import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { DisplayPage } from '~/linodes/linode/settings/layouts/DisplayPage';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/settings/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('makes request to save changes', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const change = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    change('group', 'foobar');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: { group: 'foobar', label: testLinode.label },
      }),
    ], 2);
  });

  it('redirects if the label changed', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const change = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    change('group', 'foobar');
    change('label', 'my-new-label');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: { group: 'foobar', label: 'my-new-label' },
      }),
      () => {},
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/my-new-label/settings')),
    ], 3);
  });
});
