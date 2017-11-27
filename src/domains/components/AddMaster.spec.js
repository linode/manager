import { shallow } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { AddMaster } from '~/domains/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';


describe('domains/components/AddMaster', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('submits form and redirects to domain', async () => {
    AddMaster.trigger(dispatch);
    const component = shallow(dispatch.firstCall.args[0].body, '');

    changeInput(component, 'email', 'test@gmail.com');
    changeInput(component, 'domain', 'test.com');

    dispatch.reset();
    await component.props().onSubmit();

    expect(dispatch.callCount).toEqual(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/domains/', {
        method: 'POST',
        body: {
          domain: 'test.com',
          soa_email: 'test@gmail.com',
          type: 'master',
        },
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/domains/test.com')),
    ]);
  });
});
