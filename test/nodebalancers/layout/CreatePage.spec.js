import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { CreatePage } from '~/nodebalancers/layouts/CreatePage';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { api } from '@/data';

describe('nodebalancers/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('creates nodebalancer and redirects on form submit', async () => {
    const page = shallow(
      <CreatePage dispatch={dispatch} regions={api.regions} />
    );

    page.instance().setState({ label: 'my-label', region: 'us-east-1a' });
    await page.instance().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/nodebalancers/', {
        method: 'POST',
        body: { label: 'my-label', region: 'us-east-1a' },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/nodebalancers/my-label')),
    ]);
  });
});
