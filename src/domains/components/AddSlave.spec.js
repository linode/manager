import { shallow } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { AddSlave } from '~/domains/components';

import {
  expectDispatchOrStoreErrors, expectRequest, createSimulatedEvent,
} from '~/test.helpers';


describe('domains/components/AddSlave', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('submits form and redirects to domain', async () => {
    AddSlave.trigger(dispatch);

    const wrapper = shallow(dispatch.firstCall.args[0].body);

    const ipInput = wrapper.find('Textarea[name="ips"]');

    const domainInput = wrapper.find('Input[name="domain"]');

    ipInput.simulate('change', createSimulatedEvent('ips', '1;2;3;4'));

    domainInput.simulate('change', createSimulatedEvent('domain', 'test.com'));

    dispatch.reset();
    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toEqual(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/domains/', {
        method: 'POST',
        body: {
          domain: 'test.com',
          type: 'slave',
          master_ips: ['1', '2', '3', '4'],
        },
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/domains/test.com')),
    ]);
  });
});
