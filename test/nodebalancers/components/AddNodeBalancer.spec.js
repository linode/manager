import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddNodeBalancer } from '~/nodebalancers/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';


describe('linodes/components/AddNodeBalancer', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('adds a nodebalancer', async function () {
    AddNodeBalancer.trigger(dispatch);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'node-1');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/nodebalancers/', {
        method: 'POST',
        body: {
          region: REGION_MAP.Asia[0],
          label: 'node-1',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/nodebalancers/node-1')),
    ], 2, [{ label: 'node-1' }]);
  });
});
