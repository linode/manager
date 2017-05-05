import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import {
  SettingsPage,
} from '~/linodes/linode/backups/layouts/SettingsPage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/layouts/SettingsPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('saves settings back to the api', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );
    await page.instance().componentDidMount();

    const selectDay = page.find('select[name="day"]');
    expect(selectDay.props().value).to.equal('Monday');

    const selectWindow = page.find('select[name="window"]');
    expect(selectWindow.props().value).to.equal('W10');

    const settingsForm = page.find('Form');
    expect(settingsForm.length).to.equal(1);

    dispatch.reset();
    await settingsForm.props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        body: {
          backups: {
            schedule: {
              day: 'Monday',
              window: 'W10',
            },
          },
        },
      }),
    ]);
  });

  it('shows cancel backups modal when button is pressed', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );
    await page.instance().componentDidMount();

    const cancelButton = page.find('#backup-settings-cancel');
    expect(cancelButton.length).to.equal(1);

    dispatch.reset();
    cancelButton.simulate('click');

    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
