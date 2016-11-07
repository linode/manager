import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { api } from '@/data';
import { showModal, SHOW_MODAL } from '~/actions/modal';
import {
  SettingsPage,
  CancelBackupsModal
} from '~/linodes/linode/backups/layouts/SettingsPage';

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
        linodes={api.linodes}
        params={{ linodeId: '1234' }}
      />
    );
    await page.instance().componentDidMount();

    const selectDay = page.find('select[name="day"]');
    expect(selectDay.props().value).to.equal('Monday');

    const selectWindow = page.find('select[name="window"]');
    expect(selectWindow.props().value).to.equal('W10');

    const settingsForm = page.find('form');
    expect(settingsForm.length).to.equal(1);

    dispatch.reset();
    page.find('.btn-primary').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234', () => {}, null,
      d => expect(d.body).to.equal(JSON.stringify({
        backups: {
          schedule: {
            day: 'Monday',
            window: 'W10',
          }
        }
      }))
    );
  });

  it('shows cancel backups modal when button is pressed', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeId: '1234' }}
      />
    );
    await page.instance().componentDidMount();

    const cancelButton = page.find('.btn-delete');
    expect(cancelButton.length).to.equal(1);

    dispatch.reset();
    cancelButton.simulate('click');

    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('cancels backups when button on modal is pressed', async () => {
    const modal = shallow(
      <CancelBackupsModal linodeId={'1234'} dispatch={dispatch} />
    );

    const confirmButton = modal.find('.btn-danger');
    expect(confirmButton.length).to.equal(1);

    dispatch.reset();
    confirmButton.simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups/cancel');
  });
});
