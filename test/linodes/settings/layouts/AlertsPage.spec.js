import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { UPDATE_LINODE } from '~/actions/api/linodes';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import { AlertsPage } from '~/linodes/settings/layouts/AlertsPage';

describe('linodes/settings/layouts/AlertsPage', async () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders all alerts', () => {
    const page = mount(
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
    ].map(label => expect(page.find(<span>{label}</span>)).to.exist);
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
    await expectRequest(fn, `/linodes/${testLinode.id}`,
      (d, n) => {
        if (n === 0) {
          expect(d.args[0].type).to.equal(UPDATE_LINODE);
          expect(d.args[0].linodes).to.equal(testLinode.id);
          expect(d.args[0].linode.alerts).to.deep.equal({
            cpu: { enabled: true, threshold: 90 },
            io: { enabled: true, threshold: 5000 },
            transfer_in: { enabled: true, threshold: 5 },
            transfer_out: { enabled: true, threshold: 5 },
            transfer_quota: { enabled: true, threshold: 80 },
          });
        }
      }, { }, { method: 'PUT' });
  });
});
