import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import NewSlaveZone from '~/domains/components/NewSlaveZone';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';


describe('domains/components/NewSlaveZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('submits form and redirects to domain', async () => {
    const dispatch = sandbox.stub();
    const component = mount(
      <NewSlaveZone
        dispatch={dispatch}
      />
    );

    const change = (name, value) =>
      component.find({ name }).simulate('change', { target: { name, value } });

    change('ips', '1;2;3;4');
    change('domain', 'test.com');

    await component.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/domains/', {
        method: 'POST',
        body: {
          domain: 'test.com',
          type: 'slave',
          master_ips: ['1', '2', '3', '4'],
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/domains')),
    ]);
  });
});
