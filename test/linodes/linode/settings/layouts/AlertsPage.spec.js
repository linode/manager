import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
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
    const page = shallow(
      <AlertsPage
        linode={testLinode}
        dispatch={() => {}}
      />
    );

    [
      'CPU usage',
      'Disk IO rate',
      'Incoming traffic',
      'Outbound traffic',
      'Transfer quota',
    ].forEach((label, i) => {
      expect(page.find('.form-group').at(i).find('.col-form-label')
                 .text())
        .to.equal(`${label}:`);
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
    page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}`, { method: 'PUT' }),
    ]);
  });
});

