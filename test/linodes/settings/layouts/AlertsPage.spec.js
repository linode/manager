import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { PUT_LINODE } from '~/actions/api/linodes';
import { linodes } from '~/../test/data';
import { AlertsPage } from '~/linodes/settings/layouts/AlertsPage';

describe('linodes/settings/layouts/AlertsPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders all alerts', async() => {
    const page = mount(
      <AlertsPage linodes={linodes} params={{ linodeId: 'linode_1235' }} />
    );

    [
      'CPU usage',
      'Disk IO rate',
      'Incoming traffic',
      'Outbound traffic',
      'Transfer quota',
    ].map(label => expect(page.find(<span>{label}</span>)).to.exist);
  });

  it('maps form fields and dispatches a putLinode event', () => {
    const env = { dispatchStub: () => {} };
    const dispatchStub = sinon.stub(env, 'dispatchStub', async (f) => {
      await f(dispatchStub, () => ({
        authentication: { token: 'token' },
      }));
    });

    const page = mount(
      <AlertsPage linodes={linodes} params={{ linodeId: 'linode_1235' }} dispatch={dispatchStub} />
    );

    page.find('form').simulate('submit');
    expect(dispatchStub.calledTwice).to.equal(true);
    expect(dispatchStub.secondCall.args[0].type).to.equal(PUT_LINODE);
    expect(dispatchStub.secondCall.args[0].id).to.equal('linode_1235');
    expect(dispatchStub.secondCall.args[0].data.alerts).to.deep.equal({
      cpu: { enabled: true, threshold: 90 },
      io: { enabled: true, threshold: 5000 },
      transfer_in: { enabled: true, threshold: 5 },
      transfer_out: { enabled: true, threshold: 5 },
      transfer_quota: { enabled: true, threshold: 80 },
    });
  });
});
