import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddNodeBalancer } from '~/nodebalancers/components';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';


describe('linodes/components/AddNodeBalancer', function () {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('adds a nodebalancer', async function () {
    AddNodeBalancer.trigger(dispatch);
    const modal = mount(dispatch.firstCall.args[0].body);

    modal.find('input[name="label"]')
      .simulate('change', createSimulatedEvent('label', 'node-1'));
    modal.find('Select[name="region"]')
      .simulate('change', createSimulatedEvent('region', REGION_MAP.Asia[0]));

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
      ([pushResult]) => expect(pushResult).toEqual(push('/nodebalancers/node-1')),
    ], 2, [{ label: 'node-1' }]);
  });
});
