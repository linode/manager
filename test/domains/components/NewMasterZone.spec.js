import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import NewMasterZone from '~/domains/components/NewMasterZone';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';


describe('domains/components/NewMasterZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('submits form and redirects to domain', async () => {
    const dispatch = sinon.stub();
    const component = mount(
      <NewMasterZone
        email="test@mail.net"
        dispatch={dispatch}
      />
    );

    const change = (name, value) =>
      component.find('Input').find({ name }).simulate('change', { target: { name, value } });

    change('email', 'test@gmail.com');
    change('domain', 'test.com');

    component.find('form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/domains/', {
        domain: 'test.com',
        soa_email: 'test@gmail.com',
        type: 'master',
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/domains/test.com')),
    ]);
  });
});
