import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import ScheduleForm from '~/linodes/linode/backups/components/ScheduleForm';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/backups/components/ScheduleForm', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it.skip('saves settings back to the api', async () => {
    const page = mount(
      <ScheduleForm
        dispatch={dispatch}
        linode={testLinode}
        window="W0"
        day="Saturday"
      />
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: {
          backups: {
            schedule: {
              day: 'Saturday',
              window: 'W0',
            },
          },
        },
      }),
    ]);
  });
});
