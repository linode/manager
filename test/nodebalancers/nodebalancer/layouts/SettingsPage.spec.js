import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { genericNodeBalancer } from '@/data/nodebalancers';
import { SettingsPage } from '~/nodebalancers/nodebalancer/layouts/SettingsPage';


describe('nodebalancers/nodebalancer/layouts/SettingsPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders display page', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={genericNodeBalancer}
      />
    );

    expect(page.find({ id: 'group' }).props().value).to.equal(genericNodeBalancer.group);
    expect(page.find({ id: 'label' }).props().value).to.equal(genericNodeBalancer.label);
  });

  it('makes request to save changes', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={genericNodeBalancer}
      />
    );

    dispatch.reset();
    page.find('form').simulate('submit', { preventDefault() {} });
    const fn = dispatch.firstCall.args[0];

    await expectDispatchOrStoreErrors(fn, [
      async ([fn]) => await expectRequest(fn, `/nodebalancers/${genericNodeBalancer.id}`, {
        method: 'PUT',
        body: {
          group: genericNodeBalancer.group,
          label: genericNodeBalancer.label,
        },
      }),
    ]);
  });

  it('redirects if the label changed', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={genericNodeBalancer}
      />
    );

    page.find('#label').simulate('change',
      { target: { value: 'newlabel' } });

    dispatch.reset();

    await page.find('form').simulate('submit', { preventDefault() {} });

    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      null,
      ([pushResult]) => expectObjectDeepEquals(
        pushResult,
        push('/nodebalancers/newlabel/settings')),
    ]);
  });
});
