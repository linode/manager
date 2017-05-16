import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { AlertsPage } from '~/linodes/linode/settings/layouts/AlertsPage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/settings/layouts/AlertsPage', async () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders all alerts', () => {
    const page = mount(
      <AlertsPage
        linode={testLinode}
        dispatch={() => {}}
      />
    );

    [
      'CPU Usage',
      'Disk IO Rate',
      'Incoming Traffic',
      'Outbound Traffic',
      'Transfer Quota',
    ].forEach((label, i) => {
      const formGroup = page.find('FormGroup').at(i);
      const labelElement = formGroup.find('.col-form-label').at(0);
      expect(labelElement.text()).to.equal(label);
    });
  });

  it('maps form fields and dispatches a putLinode event', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <AlertsPage
        linode={testLinode}
        dispatch={dispatch}
      />
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}`, { method: 'PUT' }),
    ]);
  });
});

