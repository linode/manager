import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import * as fetch from '~/fetch';
import { UPDATE_LINODE } from '~/actions/api/linodes';
import { linodes } from '~/../test/data';
import { AlertsPage } from '~/linodes/settings/layouts/AlertsPage';

describe('linodes/settings/layouts/AlertsPage', async () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders all alerts', () => {
    const page = mount(
      <AlertsPage
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
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
    const page = mount(
      <AlertsPage
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        dispatch={dispatch}
      />
    );

    page.find('form').simulate('submit');
    expect(dispatch.calledOnce).to.equal(true);
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches a linode
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1235');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_LINODE);
    expect(dispatch.firstCall.args[0].id).to.equal('linode_1235');
    expect(dispatch.firstCall.args[0].data.alerts).to.deep.equal({
      cpu: { enabled: true, threshold: 90 },
      io: { enabled: true, threshold: 5000 },
      transfer_in: { enabled: true, threshold: 5 },
      transfer_out: { enabled: true, threshold: 5 },
      transfer_quota: { enabled: true, threshold: 80 },
    });

    fetchStub.restore();
  });
});
