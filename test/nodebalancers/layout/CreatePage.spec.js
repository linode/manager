import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { api } from '@/data';
import { expectRequest, expectObjectDeepEquals } from '@/common';
import { CreatePage } from '~/nodebalancers/layouts/CreatePage';

describe('nodebalancers/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('creates nodebalancer and redirects on form submit', async () => {
    const page = shallow(
      <CreatePage dispatch={dispatch} datacenters={api.datacenters} />
    );

    page.instance().setState({ label: 'my-label', datacenter: 'newark' });
    await page.instance().onSubmit();

    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/nodebalancers/', {
      method: 'POST',
      body: { label: 'my-label', datacenter: 'newark' },
    });

    expectObjectDeepEquals(dispatch.secondCall.args[0], push('/nodebalancers'));
  });
});
