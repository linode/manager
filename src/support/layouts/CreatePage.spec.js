import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { CreatePage } from '~/support/layouts/CreatePage';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { api } from '~/data';
import { testLinode } from '~/data/linodes';


describe('support/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <CreatePage
        linodes={api.linodes.linodes}
        domains={api.domains.domains}
        nodebalancers={api.nodebalancers.nodebalancers}
        volumes={api.volumes.volumes}
        dispatch={mockDispatch}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('opens a ticket', async () => {
    const page = mount(
      <CreatePage
        linodes={api.linodes.linodes}
        domains={api.domains.domains}
        nodebalancers={api.nodebalancers.nodebalancers}
        volumes={api.volumes.volumes}
        dispatch={dispatch}
      />
    );
    const summaryWrapper = page.find('input#summary');
    summaryWrapper.simulate(
      'change',
      createSimulatedEvent('summary', 'My new ticket!')
    );

    const regardingWrapper = page.find('select#regarding');
    regardingWrapper.simulate(
      'change',
      createSimulatedEvent('regarding', `linode_id:${testLinode.id}`)
    );

    const descriptionWrapper = page.find('textarea#description');
    descriptionWrapper.simulate(
      'change',
      createSimulatedEvent('description', 'This is my new description!')
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      ([fn]) => expectRequest(fn, '/support/tickets/', {
        method: 'POST',
        body: {
          linode_id: testLinode.id,
          summary: 'My new ticket!',
          description: 'This is my new description!',
        },
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/support/2')),
    ], 2, [{ id: 2 }]);
  });
});
