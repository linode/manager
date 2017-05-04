import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import { AlertsPage } from '~/linodes/linode/settings/layouts/AlertsPage';

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
    await page.instance().componentDidMount();

    dispatch.reset();
    page.find('form').simulate('submit', { preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}`, { method: 'PUT' });
  });
});

