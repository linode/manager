import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import ScheduleForm from '~/linodes/linode/backups/components/ScheduleForm';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/components/ScheduleForm', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('saves settings back to the api', async () => {
    const page = mount(
      <ScheduleForm
        dispatch={dispatch}
        linode={testLinode}
        window="W0"
        day="Saturday"
      />
    );

    const selectDay = page.find('select[name="day"]');
    expect(selectDay.props().value).to.equal('Saturday');

    const selectWindow = page.find('select[name="window"]');
    expect(selectWindow.props().value).to.equal('W0');

    const settingsForm = page.find('Form');
    expect(settingsForm.length).to.equal(1);

    dispatch.reset();
    await settingsForm.props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
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
