import { expect } from 'chai';
import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { AddMaster } from '~/domains/components';

import {
  changeInput, expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest,
} from '@/common';


describe('domains/components/AddMaster', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('submits form and redirects to domain', async () => {
    AddMaster.trigger(dispatch);
    const component = mount(dispatch.firstCall.args[0].body, '');

    changeInput(component, 'email', 'test@gmail.com');
    changeInput(component, 'domain', 'test.com');

    dispatch.reset();
    await component.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/domains/', {
        method: 'POST',
        body: {
          domain: 'test.com',
          soa_email: 'test@gmail.com',
          type: 'master',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/domains/test.com')),
    ]);
  });
});
