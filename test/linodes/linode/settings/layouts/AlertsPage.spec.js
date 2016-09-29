import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { actions } from '~/api/configs/linodes';
import { api } from '@/data';
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
        linodes={api.linodes}
        params={{ linodeId: testLinode.id }}
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
      expect(page.find('.form-group').at(i).find('.col-sm-2 span')
                 .text())
        .to.equal(`${label}:`);
    });
  });

  it('maps form fields and dispatches a putLinode event', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <AlertsPage
        linodes={api.linodes}
        params={{ linodeId: testLinode.id }}
        dispatch={dispatch}
      />
    );
    await new Promise(r => setTimeout(r, 0));

    dispatch.reset();
    page.find('form').simulate('submit');

    await new Promise(r => setTimeout(r, 0));
    expect(dispatch.calledOnce).to.equal(true);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}`,
      (d, n) => {
        if (n === 0) {
          expect(d.args[0]).to.deep.equal(actions.one({ }, testLinode.id));
        }
      }, { }, { method: 'PUT' });
  });
});
