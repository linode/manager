import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { RebuildPage } from '~/linodes/linode/layouts/RebuildPage';
import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/layouts/RebuildPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('rebuilds the linode', async () => {
    const page = mount(
      <RebuildPage
        dispatch={dispatch}
        distributions={api.distributions}
        linode={testLinode}
      />
    );

    page.find('.LinodesDistribution').first().simulate('click');
    page.find('PasswordInput').simulate(
      'change',
      { target: { value: 'new password', name: 'password' } });

    dispatch.reset();
    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rebuild', {
        method: 'POST',
        body: {
          distribution: 'linode/debian7',
          root_pass: 'new password',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/test-linode')),
    ]);
  });
});
